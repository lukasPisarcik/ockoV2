import { translations, type Language } from './translations';
import { log } from '$lib/utils';

const STORAGE_KEY = 'ocko_language';
const DEFAULT_LANGUAGE: Language = 'sk';

/**
 * Svelte 5 class-based store for internationalization
 */
export class I18nStore {
	language = $state<Language>(DEFAULT_LANGUAGE);

	constructor() {
		// Initialize from localStorage or browser preference
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
			if (stored && (stored === 'en' || stored === 'sk')) {
				this.language = stored;
			} else {
				// Detect browser language
				const browserLang = navigator.language.slice(0, 2);
				this.language = browserLang === 'en' ? 'en' : 'sk';
			}
		}
	}

	/**
	 * Get translations for current language
	 */
	get t() {
		return translations[this.language];
	}

	/**
	 * Set language and persist to localStorage
	 */
	setLanguage(lang: Language) {
		const initId = crypto.randomUUID();
		log.info({ initId, lang }, 'I18nStore: Setting language');

		this.language = lang;
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, lang);
		}
	}

	/**
	 * Toggle between languages
	 */
	toggle() {
		this.setLanguage(this.language === 'en' ? 'sk' : 'en');
	}
}

// Singleton instance
let i18nInstance: I18nStore | null = null;

export function getI18n(): I18nStore {
	if (!i18nInstance) {
		i18nInstance = new I18nStore();
	}
	return i18nInstance;
}
