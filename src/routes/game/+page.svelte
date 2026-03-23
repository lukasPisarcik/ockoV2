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
	import { RotateCcw, Settings, Loader2, ChevronDown, ChevronUp, SkipForward } from 'lucide-svelte';
	import { log } from '$lib/utils';
	import { getI18n } from '$lib/i18n';

	const gameStore = new GameStore();
	const i18n = getI18n();
	const user = getUser();

	let showEditDialog = $state(false);
	let showMemePopup = $state(false);
	let currentMeme = $state<MemeType>('BANK');
	let isLoading = $state(true);
	let isBankExpanded = $state(false);
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

	async function handleNextRound() {
		if (!gameStore.game) return;

		const convex = getConvexClient();
		if (!convex) return;

		const initId = crypto.randomUUID();
		log.info({ initId }, 'GamePage: Advancing to next round');

		// Optimistic update
		gameStore.nextRound();

		try {
			await convex.mutation(api.games.nextRound, {
				id: gameStore.game._id as Id<'games'>
			});
		} catch (e) {
			log.error({ initId, error: e }, 'GamePage: Failed to advance round');
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

<div class="space-y-3 sm:space-y-6">
	{#if isLoading}
		<Card class="text-center py-12">
			<CardContent class="flex flex-col items-center gap-4">
				<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				<p class="text-muted-foreground">{i18n.t.common.loading}</p>
			</CardContent>
		</Card>
	{:else if gameStore.game}
		<!-- Bank Display (Collapsible) -->
		<Card>
			<button
				class="w-full text-left"
				onclick={() => (isBankExpanded = !isBankExpanded)}
			>
				<div class="flex flex-row items-center justify-between px-4 sm:px-6 py-2 sm:py-3">
					<div class="flex items-center gap-2 sm:gap-3">
						<span class="text-base font-semibold tracking-tight">{i18n.t.game.bank}</span>
						{#if !isBankExpanded}
							<span class="text-sm text-muted-foreground">
								{gameStore.game.initialBank}€
							</span>
							<span class="text-sm">→</span>
							<span
								class="text-sm font-semibold"
								class:text-green-600={gameStore.game.currentBank > gameStore.game.initialBank * 0.5}
								class:text-yellow-600={gameStore.game.currentBank <= gameStore.game.initialBank * 0.5 &&
									gameStore.game.currentBank > gameStore.game.initialBank * 0.2}
								class:text-red-600={gameStore.game.currentBank <= gameStore.game.initialBank * 0.2}
							>
								{gameStore.game.currentBank}€
							</span>
						{/if}
					</div>
					<div class="flex items-center gap-3">
						<span class="text-sm text-muted-foreground">
							{i18n.t.game.round} {gameStore.game.currentRound ?? 1}
						</span>
						{#if isBankExpanded}
							<ChevronUp class="h-4 w-4 text-muted-foreground shrink-0" />
						{:else}
							<ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
						{/if}
					</div>
				</div>
			</button>
			{#if isBankExpanded}
				<CardContent class="space-y-3 pt-0">
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<p class="text-xs text-muted-foreground">{i18n.t.game.initial}</p>
							<p class="text-xl font-bold">{gameStore.game.initialBank}€</p>
						</div>
						<Separator orientation="vertical" class="h-10" />
						<div class="space-y-0.5 text-right">
							<p class="text-xs text-muted-foreground">{i18n.t.game.remaining}</p>
							<p
								class="text-xl font-bold"
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
					<Separator />
					<div class="flex gap-2">
						<Button variant="outline" size="sm" class="flex-1" onclick={handleReset}>
							<RotateCcw class="h-4 w-4 mr-2" />
							{i18n.t.game.reset}
						</Button>
						<Button variant="outline" size="sm" class="flex-1" onclick={() => (showEditDialog = true)}>
							<Settings class="h-4 w-4 mr-2" />
							{i18n.t.game.edit}
						</Button>
					</div>
					<Button variant="default" size="sm" class="w-full" onclick={handleNextRound}>
						<SkipForward class="h-4 w-4 mr-2" />
						{i18n.t.game.nextRound}
					</Button>
				</CardContent>
			{/if}
		</Card>

		<!-- Players -->
		<div class="space-y-2 sm:space-y-4">
			<h2 class="text-lg sm:text-xl font-semibold">{i18n.t.game.players}</h2>
			<div class="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
