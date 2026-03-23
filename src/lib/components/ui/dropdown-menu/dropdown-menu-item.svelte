<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
		disabled?: boolean;
		onclick?: () => void;
	};

	let {
		class: className,
		disabled = false,
		onclick,
		children
	}: Props & { children?: import('svelte').Snippet } = $props();
</script>

<DropdownMenuPrimitive.Item
	{disabled}
	class={cn(
		'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	onSelect={onclick}
>
	{@render children?.()}
</DropdownMenuPrimitive.Item>
