<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { getTheme } from '$lib/stores';
	import { getI18n } from '$lib/i18n';
	import { Sun, Moon } from 'lucide-svelte';

	const theme = getTheme();
	const i18n = getI18n();
</script>

<Button variant="ghost" size="icon" onclick={() => theme.toggle()} title={i18n.t.common.theme}>
	{#if theme.theme === 'light'}
		<Sun class="h-4 w-4" />
	{:else}
		<Moon class="h-4 w-4" />
	{/if}
</Button>
