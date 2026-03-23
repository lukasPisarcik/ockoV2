<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';

	type Props = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		open = $bindable(false),
		onOpenChange,
		children
	}: Props & { children?: import('svelte').Snippet } = $props();
</script>

<SheetPrimitive.Root bind:open {onOpenChange}>
	{@render children?.()}
</SheetPrimitive.Root>
