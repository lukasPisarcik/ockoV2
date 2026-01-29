import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get a user by ID
 */
export const get = query({
	args: { id: v.id('users') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

/**
 * Get or create a user by name
 * Used to identify returning users
 */
export const getOrCreate = mutation({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		// Try to find existing user by name
		const existingUser = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('name'), args.name))
			.first();

		if (existingUser) {
			return existingUser._id;
		}

		// Create new user
		const userId = await ctx.db.insert('users', {
			name: args.name,
			createdAt: Date.now()
		});

		return userId;
	}
});

/**
 * Create a new user
 */
export const create = mutation({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		const userId = await ctx.db.insert('users', {
			name: args.name,
			createdAt: Date.now()
		});

		return userId;
	}
});
