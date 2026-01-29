import { ConvexClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';

/**
 * Singleton Convex client for the application
 */
let convexClient: ConvexClient | null = null;

export function getConvexClient(): ConvexClient {
	if (!convexClient) {
		convexClient = new ConvexClient(PUBLIC_CONVEX_URL);
	}
	return convexClient;
}
