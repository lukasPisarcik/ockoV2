<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
	};

	let { class: className, children }: Props & { children?: import('svelte').Snippet } = $props();
</script>

<tbody class={cn('[&_tr:last-child]:border-0', className)}>
	{@render children?.()}
</tbody>
