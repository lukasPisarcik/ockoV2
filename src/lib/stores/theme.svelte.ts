import { log } from '$lib/utils';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ocko_theme';

/**
 * Svelte 5 class-based store for theme management
 */
export class ThemeStore {
	theme = $state<Theme>('system');
	resolvedTheme = $state<'light' | 'dark'>('light');

	private mediaQuery: MediaQueryList | null = null;

	constructor() {
		if (typeof window !== 'undefined') {
			// Load saved theme
			const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
			if (stored && ['light', 'dark', 'system'].includes(stored)) {
				this.theme = stored;
			}

			// Set up media query listener for system preference
			this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			this.mediaQuery.addEventListener('change', this.handleSystemChange);

			// Initial resolve
			this.resolveTheme();
		}
	}

	/**
	 * Handle system theme change
	 */
	private handleSystemChange = () => {
		if (this.theme === 'system') {
			this.resolveTheme();
		}
	};

	/**
	 * Resolve the actual theme based on preference
	 */
	private resolveTheme() {
		if (this.theme === 'system') {
			this.resolvedTheme = this.mediaQuery?.matches ? 'dark' : 'light';
		} else {
			this.resolvedTheme = this.theme;
		}

		// Apply to document
		this.applyTheme();
	}

	/**
	 * Apply theme to document
	 */
	private applyTheme() {
		if (typeof document !== 'undefined') {
			const root = document.documentElement;
			if (this.resolvedTheme === 'dark') {
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
		this.resolveTheme();
	}

	/**
	 * Cycle through themes
	 */
	cycle() {
		const themes: Theme[] = ['light', 'dark', 'system'];
		const currentIndex = themes.indexOf(this.theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		this.setTheme(themes[nextIndex]);
	}

	/**
	 * Initialize theme (call on mount)
	 */
	init() {
		this.resolveTheme();
	}

	/**
	 * Dispose resources
	 */
	dispose() {
		if (this.mediaQuery) {
			this.mediaQuery.removeEventListener('change', this.handleSystemChange);
		}
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
