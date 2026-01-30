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
	memePlayerName = $state<string>('');
	
	// Track which milestones have been shown to avoid repeating
	private shownMilestones = new Set<string>();

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

		// Check if memes are enabled
		if (this.game.enableMemes === false) {
			this.showMeme = false;
			return;
		}

		// Bank is empty
		if (this.game.currentBank <= 0) {
			const milestoneKey = 'bank_empty';
			if (!this.shownMilestones.has(milestoneKey)) {
				this.memeType = 'BANK';
				this.memePlayerName = '';
				this.showMeme = true;
				this.shownMilestones.add(milestoneKey);
				return;
			}
		}

		// Check individual player milestones (every 50)
		for (const player of this.game.players) {
			// Calculate which 50-milestone the player is at
			const winMilestone = Math.floor(player.value / 50);
			const loseMilestone = Math.floor(Math.abs(player.value) / 50);

			// Player won 50+ (positive milestones: 50, 100, 150, ...)
			if (player.value >= 50) {
				const milestoneKey = `${player._id}_win_${winMilestone}`;
				if (!this.shownMilestones.has(milestoneKey)) {
					this.memeType = 'WIN';
					this.memePlayerName = player.name;
					this.showMeme = true;
					this.shownMilestones.add(milestoneKey);
					return;
				}
			}

			// Player lost 50+ (negative milestones: -50, -100, -150, ...)
			if (player.value <= -50) {
				const milestoneKey = `${player._id}_lose_${loseMilestone}`;
				if (!this.shownMilestones.has(milestoneKey)) {
					this.memeType = 'LOSE';
					this.memePlayerName = player.name;
					this.showMeme = true;
					this.shownMilestones.add(milestoneKey);
					return;
				}
			}
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
		this.shownMilestones.clear();
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
