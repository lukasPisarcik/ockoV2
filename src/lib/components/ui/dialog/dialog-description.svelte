<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
	};

	let { class: className, children }: Props & { children?: import('svelte').Snippet } = $props();
</script>

<DialogPrimitive.Description class={cn('text-sm text-muted-foreground', className)}>
	{@render children?.()}
</DialogPrimitive.Description>
