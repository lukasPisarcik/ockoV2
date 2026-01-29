<script lang="ts">
	import type { Player } from '$lib/schemas';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Minus, Plus } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { getI18n } from '$lib/i18n';

	type Props = {
		player: Player;
		onUpdateValue: (newValue: number) => void;
	};

	let { player, onUpdateValue }: Props = $props();

	const i18n = getI18n();

	let isEditing = $state(false);
	let editValue = $state(0);

	// Sync edit value with player value
	$effect(() => {
		if (!isEditing) {
			editValue = player.value;
		}
	});

	function handleDelta(delta: number) {
		onUpdateValue(player.value + delta);
	}

	function handleManualEdit() {
		isEditing = true;
		editValue = player.value;
	}

	function commitEdit() {
		isEditing = false;
		if (editValue !== player.value) {
			onUpdateValue(editValue);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			commitEdit();
		} else if (e.key === 'Escape') {
			isEditing = false;
			editValue = player.value;
		}
	}

	// Color based on value
	const valueColor = $derived(
		player.value > 0 ? 'text-green-600' : player.value < 0 ? 'text-red-600' : 'text-foreground'
	);
</script>

<Card class="w-full">
	<CardContent class="p-4">
		<div class="flex flex-col gap-3">
			<!-- Player Name -->
			<div class="text-center font-semibold text-lg">{player.name}</div>

			<!-- Value Display / Edit -->
			<div class="flex items-center justify-center gap-4">
				<!-- -5 Button -->
				<Button
					variant="outline"
					size="sm"
					class="h-10 w-10 text-lg font-bold"
					onclick={() => handleDelta(-5)}
				>
					-5
				</Button>

				<!-- -1 Button -->
				<Button
					variant="outline"
					size="icon"
					class="h-10 w-10"
					onclick={() => handleDelta(-1)}
				>
					<Minus class="h-4 w-4" />
				</Button>

				<!-- Value Display (clickable for manual edit) -->
				{#if isEditing}
					<Input
						type="number"
						class="w-20 text-center text-xl font-bold"
						bind:value={editValue}
						onblur={commitEdit}
						onkeydown={handleKeyDown}
					/>
				{:else}
					<button
						class={cn(
							'min-w-[60px] text-2xl font-bold cursor-pointer hover:bg-muted rounded px-2 py-1 transition-colors',
							valueColor
						)}
						onclick={handleManualEdit}
						title={i18n.t.playerCard.clickToEdit}
					>
						{player.value}€
					</button>
				{/if}

				<!-- +1 Button -->
				<Button
					variant="outline"
					size="icon"
					class="h-10 w-10"
					onclick={() => handleDelta(1)}
				>
					<Plus class="h-4 w-4" />
				</Button>

				<!-- +5 Button -->
				<Button
					variant="outline"
					size="sm"
					class="h-10 w-10 text-lg font-bold"
					onclick={() => handleDelta(5)}
				>
					+5
				</Button>
			</div>
		</div>
	</CardContent>
</Card>
