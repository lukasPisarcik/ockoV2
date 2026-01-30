import { log } from '$lib/utils';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'ocko_theme';

/**
 * Svelte 5 class-based store for theme management
 * Uses system preference as default, but saves user preference
 */
export class ThemeStore {
	theme = $state<Theme>('light');

	constructor() {
		if (typeof window !== 'undefined') {
			// Check for saved preference first
			const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
			if (stored && ['light', 'dark'].includes(stored)) {
				this.theme = stored;
			} else {
				// Fall back to system preference
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				this.theme = prefersDark ? 'dark' : 'light';
			}

			// Apply theme immediately
			this.applyTheme();
		}
	}

	/**
	 * Apply theme to document
	 */
	private applyTheme() {
		if (typeof document !== 'undefined') {
			const root = document.documentElement;
			if (this.theme === 'dark') {
				root.classList.add('dark');
			} else {
				root.classList.remove('dark');
			}
		}
	}

	/**
	 * Set theme and persist
	 */
	setTheme(theme: Theme) {
		const initId = crypto.randomUUID();
		log.info({ initId, theme }, 'ThemeStore: Setting theme');

		this.theme = theme;
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, theme);
		}
		this.applyTheme();
	}

	/**
	 * Toggle between light and dark
	 */
	toggle() {
		this.setTheme(this.theme === 'light' ? 'dark' : 'light');
	}

	/**
	 * Initialize theme (call on mount)
	 */
	init() {
		this.applyTheme();
	}

	/**
	 * Dispose resources
	 */
	dispose() {
		// Nothing to clean up now
	}
}

// Singleton instance
let themeInstance: ThemeStore | null = null;

export function getTheme(): ThemeStore {
	if (!themeInstance) {
		themeInstance = new ThemeStore();
	}
	return themeInstance;
}
