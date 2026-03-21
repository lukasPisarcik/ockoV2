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
	<CardContent class="p-2 sm:p-3">
		<div class="flex items-center gap-2 sm:gap-3">
			<!-- Player Name -->
			<div class="font-semibold text-sm sm:text-base min-w-[60px] truncate">{player.name}</div>

			<!-- Value Display / Edit -->
			<div class="flex items-center justify-end gap-1 sm:gap-2 flex-1">
				<!-- -5 Button -->
				<Button
					variant="outline"
					size="sm"
					class="h-8 w-8 sm:h-9 sm:w-9 text-sm sm:text-base font-bold p-0"
					onclick={() => handleDelta(-5)}
				>
					-5
				</Button>

				<!-- -1 Button -->
				<Button
					variant="outline"
					size="icon"
					class="h-8 w-8 sm:h-9 sm:w-9"
					onclick={() => handleDelta(-1)}
				>
					<Minus class="h-3 w-3 sm:h-4 sm:w-4" />
				</Button>

				<!-- Value Display (clickable for manual edit) -->
				{#if isEditing}
					<Input
						type="number"
						class="w-16 sm:w-20 text-center text-base sm:text-lg font-bold h-8 sm:h-9"
						bind:value={editValue}
						onblur={commitEdit}
						onkeydown={handleKeyDown}
					/>
				{:else}
					<button
						class={cn(
							'min-w-[50px] sm:min-w-[60px] text-lg sm:text-xl font-bold cursor-pointer hover:bg-muted rounded px-1 sm:px-2 py-0.5 transition-colors',
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
					class="h-8 w-8 sm:h-9 sm:w-9"
					onclick={() => handleDelta(1)}
				>
					<Plus class="h-3 w-3 sm:h-4 sm:w-4" />
				</Button>

				<!-- +5 Button -->
				<Button
					variant="outline"
					size="sm"
					class="h-8 w-8 sm:h-9 sm:w-9 text-sm sm:text-base font-bold p-0"
					onclick={() => handleDelta(5)}
				>
					+5
				</Button>
			</div>
		</div>
	</CardContent>
</Card>
