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
	import { GameStore } from '$lib/stores';
	import type { MemeType, GameWithPlayers } from '$lib/schemas';
	import { RotateCcw, Settings } from 'lucide-svelte';
	import { log } from '$lib/utils';
	import { getI18n } from '$lib/i18n';

	const gameStore = new GameStore();
	const i18n = getI18n();

	let showEditDialog = $state(false);
	let showMemePopup = $state(false);
	let currentMeme = $state<MemeType>('BANK');

	onMount(() => {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'GamePage: Mounting');

		// Try to load game from sessionStorage (new game)
		const newGameData = sessionStorage.getItem('ocko_new_game');
		if (newGameData) {
			try {
				const { initialBank, playerNames } = JSON.parse(newGameData);
				const game: GameWithPlayers = {
					_id: crypto.randomUUID(),
					userId: 'local',
					initialBank,
					currentBank: initialBank,
					startedAt: Date.now(),
					isActive: true,
					players: playerNames.map((name: string, index: number) => ({
						_id: crypto.randomUUID(),
						gameId: 'local',
						name,
						value: 0,
						position: index
					}))
				};
				gameStore.init(game);
				sessionStorage.removeItem('ocko_new_game');

				// Save to localStorage for persistence
				localStorage.setItem('ocko_current_game', JSON.stringify(game));
			} catch (e) {
				log.error({ initId, error: e }, 'GamePage: Failed to parse new game data');
			}
		} else {
			// Try to load from localStorage (continue game)
			const savedGame = localStorage.getItem('ocko_current_game');
			if (savedGame) {
				try {
					const game = JSON.parse(savedGame);
					gameStore.init(game);
				} catch (e) {
					log.error({ initId, error: e }, 'GamePage: Failed to parse saved game');
				}
			}
		}

		return () => {
			gameStore.dispose();
		};
	});

	function handleUpdatePlayerValue(playerId: string, newValue: number) {
		gameStore.updatePlayerValue(playerId, newValue);

		// Save to localStorage
		if (gameStore.game) {
			localStorage.setItem('ocko_current_game', JSON.stringify(gameStore.game));
		}

		// Check for meme conditions
		if (gameStore.showMeme) {
			currentMeme = gameStore.memeType;
			showMemePopup = true;
		}
	}

	function handleReset() {
		gameStore.reset();
		if (gameStore.game) {
			localStorage.setItem('ocko_current_game', JSON.stringify(gameStore.game));
		}
	}

	function handleEditSubmit(bank: number, playerNames: string[]) {
		if (!gameStore.game) return;

		// Update game with new settings
		const updatedGame: GameWithPlayers = {
			...gameStore.game,
			initialBank: bank,
			currentBank: bank,
			players: playerNames.map((name, index) => {
				const existingPlayer = gameStore.game!.players.find((p) => p.name === name);
				return existingPlayer || {
					_id: crypto.randomUUID(),
					gameId: gameStore.game!._id,
					name,
					value: 0,
					position: index
				};
			})
		};

		// Recalculate bank based on player values
		const playersValueSum = updatedGame.players.reduce((sum, p) => sum + p.value * -1, 0);
		updatedGame.currentBank = updatedGame.initialBank + playersValueSum;

		gameStore.setGame(updatedGame);
		localStorage.setItem('ocko_current_game', JSON.stringify(updatedGame));
		showEditDialog = false;
	}

	function dismissMeme() {
		showMemePopup = false;
		gameStore.dismissMeme();
	}
</script>

<div class="space-y-6">
	{#if gameStore.game}
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
			onSubmit={handleEditSubmit}
		/>

		<!-- Meme Popup -->
		<MemePopup bind:open={showMemePopup} memeType={currentMeme} onClose={dismissMeme} />
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
