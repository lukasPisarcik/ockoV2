import type { GameWithPlayers, MemeType, Player } from '$lib/schemas';
import { log } from '$lib/utils';

/**
 * Svelte 5 class-based store for game state
 */
export class GameStore {
	game = $state<GameWithPlayers | null>(null);
	isLoading = $state(false);
	error = $state<string | null>(null);
	showMeme = $state(false);
	memeType = $state<MemeType>('BANK');

	/**
	 * Initialize with a game
	 */
	init(game: GameWithPlayers | null) {
		const initId = crypto.randomUUID();
		log.info({ initId, gameId: game?._id }, 'GameStore: Initializing');

		this.game = game;
		this.checkMemeConditions();
	}

	/**
	 * Update the current game
	 */
	setGame(game: GameWithPlayers | null) {
		this.game = game;
		this.checkMemeConditions();
	}

	/**
	 * Update a player's value locally (optimistic update)
	 */
	updatePlayerValue(playerId: string, newValue: number) {
		if (!this.game) return;

		const playerIndex = this.game.players.findIndex((p) => p._id === playerId);
		if (playerIndex === -1) return;

		// Update player value
		this.game.players[playerIndex].value = newValue;

		// Recalculate bank
		const playersValueSum = this.game.players.reduce((sum, p) => sum + p.value * -1, 0);
		this.game.currentBank = this.game.initialBank + playersValueSum;

		this.checkMemeConditions();
	}

	/**
	 * Check conditions for showing meme popups
	 */
	private checkMemeConditions() {
		if (!this.game) return;

		// Bank is empty
		if (this.game.currentBank <= 0) {
			this.memeType = 'BANK';
			this.showMeme = true;
			return;
		}

		// Calculate total player values
		const playersValueSum = this.game.players.reduce((sum, p) => sum + p.value, 0);

		// Players collectively lost 100
		if (playersValueSum === -100) {
			this.memeType = 'LOSE';
			this.showMeme = true;
			return;
		}

		// Players collectively won 100
		if (playersValueSum === 100) {
			this.memeType = 'WIN';
			this.showMeme = true;
			return;
		}

		this.showMeme = false;
	}

	/**
	 * Dismiss the meme popup
	 */
	dismissMeme() {
		this.showMeme = false;
	}

	/**
	 * Reset game state
	 */
	reset() {
		if (!this.game) return;

		this.game.players.forEach((p) => (p.value = 0));
		this.game.currentBank = this.game.initialBank;
		this.showMeme = false;
	}

	/**
	 * Get bank progress percentage
	 */
	get bankProgress() {
		if (!this.game || this.game.initialBank === 0) return 0;
		return Math.max(0, Math.min(100, (this.game.currentBank / this.game.initialBank) * 100));
	}

	/**
	 * Check if game has an active game
	 */
	get hasActiveGame() {
		return this.game !== null && this.game.isActive;
	}

	/**
	 * Dispose store resources
	 */
	dispose() {
		log.info({}, 'GameStore: Disposing');
		this.game = null;
	}
}
