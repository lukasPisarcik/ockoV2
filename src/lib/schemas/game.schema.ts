import { z } from 'zod';
import { PlayerSchema } from './player.schema';

/**
 * Schema for creating a new game
 */
export const CreateGameSchema = z.object({
	initialBank: z.number().positive('Bank must be positive'),
	playerNames: z.array(z.string().min(1)).min(1, 'At least one player required'),
	enableMemes: z.boolean().default(true)
});

export type CreateGame = z.infer<typeof CreateGameSchema>;

/**
 * Schema for a game from the database
 */
export const GameSchema = z.object({
	_id: z.string(),
	userId: z.string(),
	initialBank: z.number(),
	currentBank: z.number(),
	currentRound: z.number().optional(),
	startedAt: z.number(),
	endedAt: z.number().optional(),
	isActive: z.boolean(),
	enableMemes: z.boolean().default(true)
});

export type Game = z.infer<typeof GameSchema>;

/**
 * Schema for a game with its players
 */
export const GameWithPlayersSchema = GameSchema.extend({
	players: z.array(PlayerSchema)
});

export type GameWithPlayers = z.infer<typeof GameWithPlayersSchema>;

/**
 * Meme types for game events
 */
export const MemeTypeSchema = z.enum(['BANK', 'WIN', 'LOSE']);

export type MemeType = z.infer<typeof MemeTypeSchema>;
