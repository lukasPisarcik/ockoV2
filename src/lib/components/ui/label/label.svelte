<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		for?: string;
		class?: string;
	};

	let {
		for: htmlFor,
		class: className,
		children
	}: Props & { children?: import('svelte').Snippet } = $props();
</script>

<label
	for={htmlFor}
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
>
	{@render children?.()}
</label>
