import { getConvexClient } from '$lib/convex';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { log } from '$lib/utils';
import { getContext, setContext } from 'svelte';

const USER_CONTEXT_KEY = Symbol('user');

export function setUser(user: UserStore) {
	setContext(USER_CONTEXT_KEY, user);
}

export function getUser(): UserStore {
	return getContext<UserStore>(USER_CONTEXT_KEY);
}

/**
 * Svelte 5 class-based store for user state
 * Uses device-based anonymous authentication
 * Persists deviceId to localStorage, user data lives in Convex
 */
export class UserStore {
	userId = $state<Id<'users'> | null>(null);
	deviceId = $state<string | null>(null);
	userName = $state<string | null>(null);
	isLoading = $state(false);
	isInitialized = $state(false);

	private readonly DEVICE_ID_KEY = 'ocko_device_id';

	/**
	 * Initialize store - checks for existing user, doesn't create new one
	 */
	async init() {
		if (this.isInitialized) return;

		const initId = crypto.randomUUID();
		log.info({ initId }, 'UserStore: Initializing');

		const convex = getConvexClient();
		if (!convex) return; // SSR - skip

		this.isLoading = true;

		try {
			// Get or generate deviceId
			let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
			if (!deviceId) {
				deviceId = crypto.randomUUID();
				localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
				log.info({ initId, deviceId }, 'UserStore: Generated new deviceId');
			} else {
				log.info({ initId, deviceId }, 'UserStore: Restored deviceId from storage');
			}

			this.deviceId = deviceId;

			// Check if user already exists (don't create yet)
			const existingUser = await convex.query(api.users.getByDeviceId, { deviceId });

			if (existingUser) {
				this.userId = existingUser._id;
				this.userName = existingUser.name ?? null;
				log.info({ initId, userId: existingUser._id, userName: existingUser.name }, 'UserStore: User loaded');
			} else {
				log.info({ initId, deviceId }, 'UserStore: No existing user, waiting for name');
			}

			this.isInitialized = true;
		} catch (error) {
			log.error({ initId, error }, 'UserStore: Failed to initialize');
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Set user's name - creates user if doesn't exist, updates if exists
	 */
	async setName(name: string) {
		const convex = getConvexClient();
		if (!convex || !this.deviceId) return;

		const initId = crypto.randomUUID();
		log.info({ initId, name }, 'UserStore: Setting name');

		try {
			if (this.userId) {
				// User exists, just update name
				const user = await convex.mutation(api.users.updateName, {
					id: this.userId,
					name
				});
				if (user) {
					this.userName = user.name ?? null;
				}
			} else {
				// Create new user with name
				const user = await convex.mutation(api.users.getOrCreateByDeviceId, {
					deviceId: this.deviceId,
					name
				});
				if (user) {
					this.userId = user._id;
					this.userName = user.name ?? null;
					log.info({ initId, userId: user._id }, 'UserStore: User created');
				}
			}
		} catch (error) {
			log.error({ initId, error }, 'UserStore: Failed to set name');
		}
	}

	/**
	 * Clear user data (keeps deviceId - same device, fresh start)
	 */
	clear() {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'UserStore: Clearing user');

		this.userId = null;
		this.userName = null;
		this.isInitialized = false;
	}

	/**
	 * Full reset - removes deviceId too (like a new device)
	 */
	fullReset() {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'UserStore: Full reset');

		this.userId = null;
		this.deviceId = null;
		this.userName = null;
		this.isInitialized = false;

		if (typeof window !== 'undefined') {
			localStorage.removeItem(this.DEVICE_ID_KEY);
		}
	}

	/**
	 * Check if user is ready
	 */
	get isReady() {
		return this.isInitialized && this.userId !== null;
	}

	/**
	 * Dispose store resources
	 */
	dispose() {
		log.info({}, 'UserStore: Disposing');
	}
}
