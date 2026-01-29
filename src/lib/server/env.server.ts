import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Private environment variables schema (server-only)
 */
const PrivateEnvSchema = z.object({
	CONVEX_DEPLOYMENT: z.string().optional()
});

/**
 * Public environment variables schema (accessible on client)
 */
const PublicEnvSchema = z.object({
	PUBLIC_CONVEX_URL: z.string().url('Invalid Convex URL')
});

/**
 * Get a validated private environment variable
 */
export function PrivateEnvValue<K extends keyof z.infer<typeof PrivateEnvSchema>>(
	key: K
): z.infer<typeof PrivateEnvSchema>[K] {
	const result = PrivateEnvSchema.shape[key].safeParse(env[key]);
	if (!result.success) {
		throw new Error(`Invalid environment variable ${key}: ${result.error.message}`);
	}
	return result.data as z.infer<typeof PrivateEnvSchema>[K];
}

/**
 * Get a validated public environment variable
 */
export function PublicEnvValue<K extends keyof z.infer<typeof PublicEnvSchema>>(
	key: K
): z.infer<typeof PublicEnvSchema>[K] {
	const result = PublicEnvSchema.shape[key].safeParse(publicEnv[key]);
	if (!result.success) {
		throw new Error(`Invalid environment variable ${key}: ${result.error.message}`);
	}
	return result.data as z.infer<typeof PublicEnvSchema>[K];
}
