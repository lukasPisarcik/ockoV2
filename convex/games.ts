import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get a game by ID with its players
 */
export const get = query({
	args: { id: v.id('games') },
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.id);
		if (!game) return null;

		const players = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', args.id))
			.collect();

		return {
			...game,
			players: players.sort((a, b) => a.position - b.position)
		};
	}
});

/**
 * Get active game for a user
 */
export const getActive = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		const game = await ctx.db
			.query('games')
			.withIndex('by_user_active', (q) => q.eq('userId', args.userId).eq('isActive', true))
			.first();

		if (!game) return null;

		const players = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', game._id))
			.collect();

		return {
			...game,
			players: players.sort((a, b) => a.position - b.position)
		};
	}
});

/**
 * Get all games for a user (for history)
 */
export const listByUser = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		const games = await ctx.db
			.query('games')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.order('desc')
			.collect();

		// Get players for each game
		const gamesWithPlayers = await Promise.all(
			games.map(async (game) => {
				const players = await ctx.db
					.query('players')
					.withIndex('by_game', (q) => q.eq('gameId', game._id))
					.collect();

				return {
					...game,
					players: players.sort((a, b) => a.position - b.position)
				};
			})
		);

		return gamesWithPlayers;
	}
});

/**
 * Create a new game with players
 */
export const create = mutation({
	args: {
		userId: v.id('users'),
		initialBank: v.number(),
		playerNames: v.array(v.string()),
		enableMemes: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		// Deactivate any existing active game
		const activeGame = await ctx.db
			.query('games')
			.withIndex('by_user_active', (q) => q.eq('userId', args.userId).eq('isActive', true))
			.first();

		if (activeGame) {
			await ctx.db.patch(activeGame._id, {
				isActive: false,
				endedAt: Date.now()
			});
		}

		// Create new game
		const gameId = await ctx.db.insert('games', {
			userId: args.userId,
			initialBank: args.initialBank,
			currentBank: args.initialBank,
			currentRound: 1,
			startedAt: Date.now(),
			isActive: true,
			enableMemes: args.enableMemes ?? true
		});

		// Create players
		for (let i = 0; i < args.playerNames.length; i++) {
			await ctx.db.insert('players', {
				gameId,
				name: args.playerNames[i],
				value: 0,
				position: i
			});
		}

		return gameId;
	}
});

/**
 * Update game's current bank
 */
export const updateBank = mutation({
	args: {
		id: v.id('games'),
		currentBank: v.number()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			currentBank: args.currentBank
		});
	}
});

/**
 * End a game
 */
export const endGame = mutation({
	args: { id: v.id('games') },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			isActive: false,
			endedAt: Date.now()
		});
	}
});

/**
 * Reset a game (set all player values to 0 and round to 1)
 */
export const reset = mutation({
	args: { id: v.id('games') },
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.id);
		if (!game) throw new Error('Game not found');

		// Reset current bank and round
		await ctx.db.patch(args.id, {
			currentBank: game.initialBank,
			currentRound: 1
		});

		// Reset all player values
		const players = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', args.id))
			.collect();

		for (const player of players) {
			await ctx.db.patch(player._id, { value: 0 });
		}
	}
});

/**
 * Advance to the next round
 */
export const nextRound = mutation({
	args: { id: v.id('games') },
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.id);
		if (!game) throw new Error('Game not found');

		await ctx.db.patch(args.id, {
			currentRound: (game.currentRound ?? 1) + 1
		});
	}
});

/**
 * Update a game's settings (bank, players, memes)
 */
export const update = mutation({
	args: {
		id: v.id('games'),
		initialBank: v.number(),
		playerNames: v.array(v.string()),
		enableMemes: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.id);
		if (!game) throw new Error('Game not found');

		// Get current players
		const currentPlayers = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', args.id))
			.collect();

		const currentPlayerNames = currentPlayers.map((p) => p.name);

		// Calculate bank difference and adjust current bank proportionally
		const bankDiff = args.initialBank - game.initialBank;
		const newCurrentBank = game.currentBank + bankDiff;

		// Update game
		await ctx.db.patch(args.id, {
			initialBank: args.initialBank,
			currentBank: Math.max(0, newCurrentBank),
			enableMemes: args.enableMemes ?? true
		});

		// Remove players that are no longer in the list
		for (const player of currentPlayers) {
			if (!args.playerNames.includes(player.name)) {
				await ctx.db.delete(player._id);
			}
		}

		// Add new players
		const maxPosition = currentPlayers.length > 0 
			? Math.max(...currentPlayers.map((p) => p.position)) 
			: -1;
		let newPosition = maxPosition + 1;

		for (const name of args.playerNames) {
			if (!currentPlayerNames.includes(name)) {
				await ctx.db.insert('players', {
					gameId: args.id,
					name,
					value: 0,
					position: newPosition++
				});
			}
		}
	}
});
