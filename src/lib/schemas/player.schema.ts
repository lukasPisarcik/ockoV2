import { z } from 'zod';

/**
 * Schema for creating a new player
 */
export const CreatePlayerSchema = z.object({
	name: z.string().min(1, 'Player name is required').max(30, 'Name too long'),
	gameId: z.string()
});

export type CreatePlayer = z.infer<typeof CreatePlayerSchema>;

/**
 * Schema for updating a player's value
 */
export const UpdatePlayerValueSchema = z.object({
	playerId: z.string(),
	delta: z.number().int('Delta must be an integer')
});

export type UpdatePlayerValue = z.infer<typeof UpdatePlayerValueSchema>;

/**
 * Schema for setting a player's value directly
 */
export const SetPlayerValueSchema = z.object({
	playerId: z.string(),
	value: z.number().int('Value must be an integer')
});

export type SetPlayerValue = z.infer<typeof SetPlayerValueSchema>;

/**
 * Schema for a player from the database
 */
export const PlayerSchema = z.object({
	_id: z.string(),
	gameId: z.string(),
	name: z.string(),
	value: z.number(),
	position: z.number()
});

export type Player = z.infer<typeof PlayerSchema>;
