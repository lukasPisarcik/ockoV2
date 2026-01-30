<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		open = $bindable(false),
		onOpenChange,
		...restProps
	}: DrawerPrimitive.RootProps = $props();
</script>

<DrawerPrimitive.Root bind:open {onOpenChange} {...restProps} />
