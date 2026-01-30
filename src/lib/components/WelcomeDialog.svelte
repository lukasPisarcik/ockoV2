<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { getI18n } from '$lib/i18n';
	import { getUser } from '$lib/stores';
	import { Loader2 } from 'lucide-svelte';

	type Props = {
		open: boolean;
	};

	let { open = $bindable(false) }: Props = $props();

	const i18n = getI18n();
	const user = getUser();

	let name = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit() {
		if (!name.trim()) {
			error = i18n.t.welcome.nameRequired;
			return;
		}

		isSubmitting = true;
		error = null;

		try {
			await user.setName(name.trim());
			open = false;
		} catch (e) {
			error = i18n.t.welcome.saveFailed;
		} finally {
			isSubmitting = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<Drawer.Root bind:open dismissible={false} onOpenChange={(isOpen) => { if (!isOpen && !user.userName) open = true; }}>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-sm pb-safe">
			<Drawer.Header class="text-center">
				<Drawer.Title class="text-2xl">{i18n.t.welcome.title}</Drawer.Title>
				<Drawer.Description>
					{i18n.t.welcome.description}
				</Drawer.Description>
			</Drawer.Header>

			<div class="px-4 py-4">
				{#if error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
						{error}
					</div>
				{/if}

				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="userName">{i18n.t.welcome.yourName}</Label>
						<Input
							id="userName"
							type="text"
							placeholder={i18n.t.welcome.namePlaceholder}
							bind:value={name}
							onkeydown={handleKeyDown}
						/>
					</div>
				</div>
			</div>

			<Drawer.Footer class="pb-6">
				<Button onclick={handleSubmit} disabled={isSubmitting} class="w-full">
					{#if isSubmitting}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
					{/if}
					{i18n.t.welcome.continue}
				</Button>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
