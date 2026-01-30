import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		deviceId: v.string(),
		name: v.optional(v.string()),
		createdAt: v.number()
	}).index('by_device_id', ['deviceId']),

	games: defineTable({
		userId: v.id('users'),
		initialBank: v.number(),
		currentBank: v.number(),
		startedAt: v.number(),
		endedAt: v.optional(v.number()),
		isActive: v.boolean(),
		enableMemes: v.optional(v.boolean())
	}).index('by_user', ['userId']).index('by_user_active', ['userId', 'isActive']),

	players: defineTable({
		gameId: v.id('games'),
		name: v.string(),
		value: v.number(),
		position: v.number()
	}).index('by_game', ['gameId'])
});
