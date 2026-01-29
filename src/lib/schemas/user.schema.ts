import { z } from 'zod';

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = z.object({
	name: z.string().min(1, 'Name is required').max(50, 'Name too long')
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

/**
 * Schema for a user from the database
 */
export const UserSchema = z.object({
	_id: z.string(),
	name: z.string(),
	createdAt: z.number()
});

export type User = z.infer<typeof UserSchema>;
