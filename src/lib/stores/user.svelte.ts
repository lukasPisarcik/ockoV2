import { log } from '$lib/utils';

/**
 * Svelte 5 class-based store for user state
 * Persists user ID to localStorage for returning users
 */
export class UserStore {
	userId = $state<string | null>(null);
	userName = $state<string | null>(null);
	isLoading = $state(false);

	private readonly STORAGE_KEY = 'ocko_user_id';
	private readonly NAME_STORAGE_KEY = 'ocko_user_name';

	/**
	 * Initialize store from localStorage
	 */
	init() {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'UserStore: Initializing');

		if (typeof window !== 'undefined') {
			const storedUserId = localStorage.getItem(this.STORAGE_KEY);
			const storedUserName = localStorage.getItem(this.NAME_STORAGE_KEY);

			if (storedUserId) {
				this.userId = storedUserId;
				log.info({ initId, userId: storedUserId }, 'UserStore: Restored user from storage');
			}

			if (storedUserName) {
				this.userName = storedUserName;
			}
		}
	}

	/**
	 * Set the current user
	 */
	setUser(userId: string, userName: string) {
		const initId = crypto.randomUUID();
		log.info({ initId, userId, userName }, 'UserStore: Setting user');

		this.userId = userId;
		this.userName = userName;

		if (typeof window !== 'undefined') {
			localStorage.setItem(this.STORAGE_KEY, userId);
			localStorage.setItem(this.NAME_STORAGE_KEY, userName);
		}
	}

	/**
	 * Clear user data
	 */
	clear() {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'UserStore: Clearing user');

		this.userId = null;
		this.userName = null;

		if (typeof window !== 'undefined') {
			localStorage.removeItem(this.STORAGE_KEY);
			localStorage.removeItem(this.NAME_STORAGE_KEY);
		}
	}

	/**
	 * Check if user is logged in
	 */
	get isLoggedIn() {
		return this.userId !== null;
	}

	/**
	 * Dispose store resources
	 */
	dispose() {
		log.info({}, 'UserStore: Disposing');
	}
}
