<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import PlayerCard from '$lib/components/PlayerCard.svelte';
	import MemePopup from '$lib/components/MemePopup.svelte';
	import NewGameDialog from '$lib/components/NewGameDialog.svelte';
	import { GameStore, getUser } from '$lib/stores';
	import { getConvexClient } from '$lib/convex';
	import { api } from '@convex/_generated/api';
	import type { MemeType } from '$lib/schemas';
	import type { Id } from '@convex/_generated/dataModel';
	import { RotateCcw, Settings, Loader2 } from 'lucide-svelte';
	import { log } from '$lib/utils';
	import { getI18n } from '$lib/i18n';

	const gameStore = new GameStore();
	const i18n = getI18n();
	const user = getUser();

	let showEditDialog = $state(false);
	let showMemePopup = $state(false);
	let currentMeme = $state<MemeType>('BANK');
	let isLoading = $state(true);
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'GamePage: Mounting');

		// Wait for user to be ready, then load active game
		const checkUser = setInterval(() => {
			if (user.isReady && user.userId) {
				clearInterval(checkUser);
				loadActiveGame(user.userId);
			}
		}, 100);

		// Timeout after 5 seconds
		setTimeout(() => {
			clearInterval(checkUser);
			isLoading = false;
		}, 5000);

		return () => {
			clearInterval(checkUser);
			if (unsubscribe) unsubscribe();
			gameStore.dispose();
		};
	});

	async function loadActiveGame(userId: Id<'users'>) {
		const convex = getConvexClient();
		if (!convex) return;

		const initId = crypto.randomUUID();
		log.info({ initId, userId }, 'GamePage: Loading active game');

		// Subscribe to active game updates
		unsubscribe = convex.onUpdate(api.games.getActive, { userId }, (game) => {
			log.info({ initId, gameId: game?._id }, 'GamePage: Game updated');
			if (game) {
				gameStore.init({
					...game,
					enableMemes: game.enableMemes ?? true
				});
			} else {
				gameStore.setGame(null);
			}
			isLoading = false;

			// Check for meme conditions after update
			if (gameStore.showMeme) {
				currentMeme = gameStore.memeType;
				showMemePopup = true;
			}
		});
	}

	async function handleUpdatePlayerValue(playerId: string, newValue: number) {
		const convex = getConvexClient();
		if (!convex) return;

		const initId = crypto.randomUUID();
		log.info({ initId, playerId, newValue }, 'GamePage: Updating player value');

		// Optimistic update
		gameStore.updatePlayerValue(playerId, newValue);

		// Check for meme conditions
		if (gameStore.showMeme) {
			currentMeme = gameStore.memeType;
			showMemePopup = true;
		}

		// Save to Convex
		try {
			await convex.mutation(api.players.setValue, {
				id: playerId as Id<'players'>,
				value: newValue
			});
		} catch (e) {
			log.error({ initId, error: e }, 'GamePage: Failed to update player value');
		}
	}

	async function handleReset() {
		if (!gameStore.game) return;

		const convex = getConvexClient();
		if (!convex) return;

		const initId = crypto.randomUUID();
		log.info({ initId }, 'GamePage: Resetting game');

		gameStore.reset();

		try {
			await convex.mutation(api.games.reset, {
				id: gameStore.game._id as Id<'games'>
			});
		} catch (e) {
			log.error({ initId, error: e }, 'GamePage: Failed to reset game');
		}
	}

	async function handleEditSubmit(bank: number, playerNames: string[], enableMemes: boolean) {
		if (!gameStore.game) return;

		const convex = getConvexClient();
		if (!convex) return;

		const initId = crypto.randomUUID();
		log.info({ initId, bank, playerNames, enableMemes }, 'GamePage: Updating game settings');

		showEditDialog = false;

		try {
			await convex.mutation(api.games.update, {
				id: gameStore.game._id as Id<'games'>,
				initialBank: bank,
				playerNames,
				enableMemes
			});
			log.info({ initId }, 'GamePage: Game updated successfully');
		} catch (e) {
			log.error({ initId, error: e }, 'GamePage: Failed to update game');
		}
	}

	function dismissMeme() {
		showMemePopup = false;
		gameStore.dismissMeme();
	}
</script>

<div class="space-y-6">
	{#if isLoading}
		<Card class="text-center py-12">
			<CardContent class="flex flex-col items-center gap-4">
				<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				<p class="text-muted-foreground">{i18n.t.common.loading}</p>
			</CardContent>
		</Card>
	{:else if gameStore.game}
		<!-- Header Controls -->
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold">{i18n.t.game.currentGame}</h1>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={handleReset}>
					<RotateCcw class="h-4 w-4 mr-2" />
					{i18n.t.game.reset}
				</Button>
				<Button variant="outline" size="sm" onclick={() => (showEditDialog = true)}>
					<Settings class="h-4 w-4 mr-2" />
					{i18n.t.game.edit}
				</Button>
			</div>
		</div>

		<!-- Bank Display -->
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-lg">{i18n.t.game.bank}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<p class="text-sm text-muted-foreground">{i18n.t.game.initial}</p>
						<p class="text-2xl font-bold">{gameStore.game.initialBank}€</p>
					</div>
					<Separator orientation="vertical" class="h-12" />
					<div class="space-y-1 text-right">
						<p class="text-sm text-muted-foreground">{i18n.t.game.remaining}</p>
						<p
							class="text-2xl font-bold"
							class:text-green-600={gameStore.game.currentBank > gameStore.game.initialBank * 0.5}
							class:text-yellow-600={gameStore.game.currentBank <= gameStore.game.initialBank * 0.5 &&
								gameStore.game.currentBank > gameStore.game.initialBank * 0.2}
							class:text-red-600={gameStore.game.currentBank <= gameStore.game.initialBank * 0.2}
						>
							{gameStore.game.currentBank}€
						</p>
					</div>
				</div>
				<Progress value={gameStore.bankProgress} />
			</CardContent>
		</Card>

		<!-- Players -->
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">{i18n.t.game.players}</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each gameStore.game.players as player (player._id)}
					<PlayerCard
						{player}
						onUpdateValue={(newValue) => handleUpdatePlayerValue(player._id, newValue)}
					/>
				{/each}
			</div>
		</div>

		<!-- Edit Dialog -->
		<NewGameDialog
			bind:open={showEditDialog}
			isEdit={true}
			existingBank={gameStore.game.initialBank}
			existingPlayers={gameStore.game.players.map((p) => p.name)}
			existingEnableMemes={gameStore.game.enableMemes ?? true}
			onSubmit={handleEditSubmit}
		/>

		<!-- Meme Popup -->
		<MemePopup bind:open={showMemePopup} memeType={currentMeme} playerName={gameStore.memePlayerName} onClose={dismissMeme} />
	{:else}
		<!-- No Game State -->
		<Card class="text-center py-12">
			<CardContent>
				<p class="text-xl text-muted-foreground mb-4">{i18n.t.game.noActiveGame}</p>
				<Button onclick={() => goto('/')}>{i18n.t.game.createNewGame}</Button>
			</CardContent>
		</Card>
	{/if}
</div>
