<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { getTheme, type Theme } from '$lib/stores';
	import { getI18n } from '$lib/i18n';
	import { Sun, Moon, Monitor } from 'lucide-svelte';

	const theme = getTheme();
	const i18n = getI18n();

	const icons = {
		light: Sun,
		dark: Moon,
		system: Monitor
	};

	const Icon = $derived(icons[theme.theme]);
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={() => theme.cycle()}
	title={i18n.t.common.theme}
>
	{#if theme.theme === 'light'}
		<Sun class="h-4 w-4" />
	{:else if theme.theme === 'dark'}
		<Moon class="h-4 w-4" />
	{:else}
		<Monitor class="h-4 w-4" />
	{/if}
</Button>
