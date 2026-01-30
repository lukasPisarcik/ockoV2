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
 * Get a user by device ID
 */
export const getByDeviceId = query({
	args: { deviceId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_device_id', (q) => q.eq('deviceId', args.deviceId))
			.first();
	}
});

/**
 * Get or create a user by device ID
 * Used for anonymous device-based authentication
 */
export const getOrCreateByDeviceId = mutation({
	args: { deviceId: v.string(), name: v.optional(v.string()) },
	handler: async (ctx, args) => {
		// Try to find existing user by deviceId
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_device_id', (q) => q.eq('deviceId', args.deviceId))
			.first();

		if (existingUser) {
			return existingUser;
		}

		// Create new user
		const userId = await ctx.db.insert('users', {
			deviceId: args.deviceId,
			name: args.name,
			createdAt: Date.now()
		});

		return await ctx.db.get(userId);
	}
});

/**
 * Update user's display name
 */
export const updateName = mutation({
	args: { id: v.id('users'), name: v.string() },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { name: args.name });
		return await ctx.db.get(args.id);
	}
});
