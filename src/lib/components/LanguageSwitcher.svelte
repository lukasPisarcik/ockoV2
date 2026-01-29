<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { getI18n, type Language } from '$lib/i18n';
	import { Languages } from 'lucide-svelte';

	const i18n = getI18n();

	const languageLabels: Record<Language, string> = {
		en: 'EN',
		sk: 'SK'
	};
</script>

<Button
	variant="ghost"
	size="sm"
	class="gap-1 px-2"
	onclick={() => i18n.toggle()}
	title={i18n.t.common.language}
>
	<Languages class="h-4 w-4" />
	<span class="text-xs font-medium">{languageLabels[i18n.language]}</span>
</Button>
