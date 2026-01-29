<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
	};

	let { class: className, children }: Props & { children?: import('svelte').Snippet } = $props();
</script>

<DialogPrimitive.Title class={cn('text-lg font-semibold leading-none tracking-tight', className)}>
	{@render children?.()}
</DialogPrimitive.Title>
