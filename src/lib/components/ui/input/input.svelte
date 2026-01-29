<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		id?: string;
		type?: 'text' | 'number' | 'email' | 'password';
		value?: string | number;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		oninput?: (e: Event) => void;
		onblur?: (e: FocusEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
	};

	let {
		id,
		type = 'text',
		value = $bindable(''),
		placeholder,
		disabled = false,
		class: className,
		oninput,
		onblur,
		onkeydown
	}: Props = $props();
</script>

<input
	{id}
	{type}
	bind:value
	{placeholder}
	{disabled}
	{oninput}
	{onblur}
	{onkeydown}
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
/>
