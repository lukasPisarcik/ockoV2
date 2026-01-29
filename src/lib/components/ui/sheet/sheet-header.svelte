<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
	};

	let { class: className, children }: Props & { children?: import('svelte').Snippet } = $props();
</script>

<div class={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>
	{@render children?.()}
</div>
