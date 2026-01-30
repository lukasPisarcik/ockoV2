import { ConvexClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { browser } from '$app/environment';

/**
 * Singleton Convex client for the application
 * Only initializes in the browser, returns null during SSR
 */
let convexClient: ConvexClient | null = null;

export function getConvexClient(): ConvexClient | null {
	if (!browser) {
		return null;
	}
	if (!convexClient) {
		convexClient = new ConvexClient(PUBLIC_CONVEX_URL);
	}
	return convexClient;
}
