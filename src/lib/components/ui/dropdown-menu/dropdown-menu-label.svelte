<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
	};

	let { class: className, children }: Props & { children?: import('svelte').Snippet } = $props();
</script>

<div class={cn('px-2 py-1.5 text-sm font-semibold', className)}>
	{@render children?.()}
</div>
