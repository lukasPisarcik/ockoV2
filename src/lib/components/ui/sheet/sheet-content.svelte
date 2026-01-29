<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { X } from 'lucide-svelte';

	type Props = {
		side?: 'left' | 'right' | 'top' | 'bottom';
		class?: string;
	};

	let { side = 'left', class: className, children }: Props & { children?: import('svelte').Snippet } = $props();

	const sideVariants = {
		left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
		right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
		top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
		bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
	};
</script>

<SheetPrimitive.Portal>
	<SheetPrimitive.Overlay
		class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
	/>
	<SheetPrimitive.Content
		class={cn(
			'fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out',
			sideVariants[side],
			className
		)}
	>
		{@render children?.()}
		<SheetPrimitive.Close
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
		>
			<X class="h-4 w-4" />
			<span class="sr-only">Close</span>
		</SheetPrimitive.Close>
	</SheetPrimitive.Content>
</SheetPrimitive.Portal>
