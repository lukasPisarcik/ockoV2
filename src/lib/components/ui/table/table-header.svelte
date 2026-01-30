<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
	};

	let { class: className, children }: Props & { children?: import('svelte').Snippet } = $props();
</script>

<thead class={cn('[&_tr]:border-b', className)}>
	{@render children?.()}
</thead>
