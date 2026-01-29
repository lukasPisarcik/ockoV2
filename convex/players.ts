import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get a player by ID
 */
export const get = query({
	args: { id: v.id('players') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

/**
 * Get all players for a game
 */
export const listByGame = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const players = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', args.gameId))
			.collect();

		return players.sort((a, b) => a.position - b.position);
	}
});

/**
 * Update a player's value (increment/decrement)
 */
export const updateValue = mutation({
	args: {
		id: v.id('players'),
		delta: v.number()
	},
	handler: async (ctx, args) => {
		const player = await ctx.db.get(args.id);
		if (!player) throw new Error('Player not found');

		const newValue = player.value + args.delta;
		await ctx.db.patch(args.id, { value: newValue });

		// Update game's current bank
		const game = await ctx.db.get(player.gameId);
		if (!game) throw new Error('Game not found');

		// Recalculate bank: initialBank - sum of all player values (inverted)
		const players = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', player.gameId))
			.collect();

		const playersValueSum = players.reduce((sum, p) => {
			// Use updated value for current player
			const val = p._id === args.id ? newValue : p.value;
			return sum + val * -1;
		}, 0);

		const newCurrentBank = game.initialBank + playersValueSum;
		await ctx.db.patch(player.gameId, { currentBank: newCurrentBank });

		return newValue;
	}
});

/**
 * Set a player's value directly (for manual editing)
 */
export const setValue = mutation({
	args: {
		id: v.id('players'),
		value: v.number()
	},
	handler: async (ctx, args) => {
		const player = await ctx.db.get(args.id);
		if (!player) throw new Error('Player not found');

		await ctx.db.patch(args.id, { value: args.value });

		// Update game's current bank
		const game = await ctx.db.get(player.gameId);
		if (!game) throw new Error('Game not found');

		// Recalculate bank
		const players = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', player.gameId))
			.collect();

		const playersValueSum = players.reduce((sum, p) => {
			const val = p._id === args.id ? args.value : p.value;
			return sum + val * -1;
		}, 0);

		const newCurrentBank = game.initialBank + playersValueSum;
		await ctx.db.patch(player.gameId, { currentBank: newCurrentBank });

		return args.value;
	}
});

/**
 * Add a player to an existing game
 */
export const add = mutation({
	args: {
		gameId: v.id('games'),
		name: v.string()
	},
	handler: async (ctx, args) => {
		// Get current max position
		const players = await ctx.db
			.query('players')
			.withIndex('by_game', (q) => q.eq('gameId', args.gameId))
			.collect();

		const maxPosition = players.length > 0 ? Math.max(...players.map((p) => p.position)) : -1;

		const playerId = await ctx.db.insert('players', {
			gameId: args.gameId,
			name: args.name,
			value: 0,
			position: maxPosition + 1
		});

		return playerId;
	}
});

/**
 * Remove a player from a game
 */
export const remove = mutation({
	args: { id: v.id('players') },
	handler: async (ctx, args) => {
		const player = await ctx.db.get(args.id);
		if (!player) throw new Error('Player not found');

		// Update game bank before removing
		const game = await ctx.db.get(player.gameId);
		if (game && player.value !== 0) {
			// Recalculate bank without this player
			const players = await ctx.db
				.query('players')
				.withIndex('by_game', (q) => q.eq('gameId', player.gameId))
				.collect();

			const playersValueSum = players
				.filter((p) => p._id !== args.id)
				.reduce((sum, p) => sum + p.value * -1, 0);

			const newCurrentBank = game.initialBank + playersValueSum;
			await ctx.db.patch(player.gameId, { currentBank: newCurrentBank });
		}

		await ctx.db.delete(args.id);
	}
});
