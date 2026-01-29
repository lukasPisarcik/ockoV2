<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	type Props = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	let { open = $bindable(false), onOpenChange, children }: Props & { children?: import('svelte').Snippet } = $props();
</script>

<DialogPrimitive.Root bind:open {onOpenChange}>
	{@render children?.()}
</DialogPrimitive.Root>
