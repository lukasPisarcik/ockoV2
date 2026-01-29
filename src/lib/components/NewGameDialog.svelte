<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { CreateGameSchema } from '$lib/schemas';
	import { formatZodErrors, log } from '$lib/utils';
	import { getI18n } from '$lib/i18n';
	import { X, Plus, AlertCircle } from 'lucide-svelte';

	type Props = {
		open: boolean;
		isEdit?: boolean;
		existingBank?: number;
		existingPlayers?: string[];
		onSubmit?: (bank: number, players: string[]) => void;
	};

	let {
		open = $bindable(false),
		isEdit = false,
		existingBank = undefined,
		existingPlayers = [],
		onSubmit
	}: Props = $props();

	const i18n = getI18n();

	let bank = $state<number | ''>('');
	let playerName = $state('');
	let players = $state<string[]>([]);
	let error = $state<string | null>(null);

	// Initialize players from props when dialog opens in edit mode
	$effect(() => {
		if (isEdit && existingPlayers.length > 0) {
			players = [...existingPlayers];
		}
		if (isEdit && existingBank !== undefined) {
			bank = existingBank;
		}
	});

	function handleAddPlayer() {
		if (playerName.trim() && !players.includes(playerName.trim())) {
			players = [...players, playerName.trim()];
			playerName = '';
		}
	}

	function handleRemovePlayer(index: number) {
		players = players.filter((_, i) => i !== index);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddPlayer();
		}
	}

	function handleSubmit() {
		const initId = crypto.randomUUID();
		log.info({ initId, bank, players }, 'NewGameDialog: Submitting');

		const validation = CreateGameSchema.safeParse({
			initialBank: typeof bank === 'number' ? bank : 0,
			playerNames: players
		});

		if (!validation.success) {
			error = formatZodErrors(validation.error);
			log.warn({ initId, error }, 'NewGameDialog: Validation failed');
			return;
		}

		error = null;

		if (onSubmit) {
			onSubmit(validation.data.initialBank, validation.data.playerNames);
		} else {
			// Store game config in sessionStorage for now (will be replaced with Convex)
			sessionStorage.setItem(
				'ocko_new_game',
				JSON.stringify({
					initialBank: validation.data.initialBank,
					playerNames: validation.data.playerNames
				})
			);
			goto('/game');
		}

		open = false;
	}

	// Reset form when dialog opens
	$effect(() => {
		if (open && !isEdit) {
			bank = '';
			players = [];
			playerName = '';
			error = null;
		}
	});
</script>

<Dialog bind:open>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>{isEdit ? i18n.t.newGameDialog.editGame : i18n.t.newGameDialog.newGame}</DialogTitle>
			<DialogDescription>
				{isEdit ? i18n.t.newGameDialog.editSettings : i18n.t.newGameDialog.setupBankAndPlayers}
			</DialogDescription>
		</DialogHeader>

		{#if error}
			<div class="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				<AlertCircle class="h-4 w-4" />
				{error}
			</div>
		{/if}

		<div class="grid gap-4 py-4">
			<!-- Bank Input -->
			<div class="grid gap-2">
				<Label for="bank">{i18n.t.newGameDialog.bank}</Label>
				<Input
					id="bank"
					type="number"
					placeholder={i18n.t.newGameDialog.enterBankAmount}
					bind:value={bank}
				/>
			</div>

			<Separator />

			<!-- Players Section -->
			<div class="grid gap-2">
				<Label>{i18n.t.newGameDialog.players}</Label>
				<div class="flex gap-2">
					<Input
						placeholder={i18n.t.newGameDialog.playerName}
						bind:value={playerName}
						onkeydown={handleKeyDown}
					/>
					<Button variant="outline" size="icon" onclick={handleAddPlayer}>
						<Plus class="h-4 w-4" />
					</Button>
				</div>

				{#if players.length === 0}
					<p class="text-sm text-muted-foreground">{i18n.t.newGameDialog.noPlayersYet}</p>
				{:else}
					<div class="flex flex-wrap gap-2 mt-2">
						{#each players as player, index}
							<Badge variant="secondary" class="gap-1 pr-1">
								{player}
								<button
									class="ml-1 rounded-full hover:bg-muted p-0.5"
									onclick={() => handleRemovePlayer(index)}
								>
									<X class="h-3 w-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => (open = false)}>{i18n.t.newGameDialog.cancel}</Button>
			<Button onclick={handleSubmit}>
				{isEdit ? i18n.t.newGameDialog.updateGame : i18n.t.newGameDialog.createGame}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
