<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { CreateGameSchema } from '$lib/schemas';
	import { formatZodErrors, log } from '$lib/utils';
	import { getI18n } from '$lib/i18n';
	import { getUser } from '$lib/stores';
	import { getConvexClient } from '$lib/convex';
	import { api } from '@convex/_generated/api';
	import { X, Plus, AlertCircle, Loader2 } from 'lucide-svelte';

	type Props = {
		open: boolean;
		isEdit?: boolean;
		existingBank?: number;
		existingPlayers?: string[];
		existingEnableMemes?: boolean;
		onSubmit?: (bank: number, players: string[], enableMemes: boolean) => void;
	};

	let {
		open = $bindable(false),
		isEdit = false,
		existingBank = undefined,
		existingPlayers = [],
		existingEnableMemes = true,
		onSubmit
	}: Props = $props();

	const i18n = getI18n();
	const user = getUser();

	let bank = $state<number | ''>('');
	let playerName = $state('');
	let players = $state<string[]>([]);
	let enableMemes = $state(true);
	let error = $state<string | null>(null);
	let isSubmitting = $state(false);

	// Initialize form when dialog opens in edit mode
	// Access existingPlayers outside the conditional to ensure it's tracked as a dependency
	$effect(() => {
		const currentPlayers = [...existingPlayers];
		const currentBank = existingBank;
		const currentEnableMemes = existingEnableMemes;

		if (open && isEdit) {
			players = currentPlayers.length > 0 ? currentPlayers : [];
			bank = currentBank !== undefined ? currentBank : '';
			enableMemes = currentEnableMemes;
			playerName = '';
			error = null;
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

	async function handleSubmit() {
		const initId = crypto.randomUUID();
		log.info({ initId, bank, players, enableMemes }, 'NewGameDialog: Submitting');

		const validation = CreateGameSchema.safeParse({
			initialBank: typeof bank === 'number' ? bank : 0,
			playerNames: players,
			enableMemes
		});

		if (!validation.success) {
			error = formatZodErrors(validation.error);
			log.warn({ initId, error }, 'NewGameDialog: Validation failed');
			return;
		}

		error = null;

		if (onSubmit) {
			onSubmit(validation.data.initialBank, validation.data.playerNames, validation.data.enableMemes);
			open = false;
			return;
		}

		// Create game via Convex
		if (!user.userId) {
			error = 'User not initialized';
			return;
		}

		const convex = getConvexClient();
		if (!convex) {
			error = 'Not ready';
			return;
		}

		isSubmitting = true;
		try {
			await convex.mutation(api.games.create, {
				userId: user.userId,
				initialBank: validation.data.initialBank,
				playerNames: validation.data.playerNames,
				enableMemes: validation.data.enableMemes
			});
			log.info({ initId }, 'NewGameDialog: Game created');
			open = false;
			goto('/game');
		} catch (e) {
			log.error({ initId, error: e }, 'NewGameDialog: Failed to create game');
			error = 'Failed to create game';
		} finally {
			isSubmitting = false;
		}
	}

	// Reset form when dialog opens and auto-add user as first player
	$effect(() => {
		if (open && !isEdit) {
			bank = '';
			playerName = '';
			enableMemes = true;
			error = null;
			
			// Auto-add user's name as first player
			if (user.userName) {
				players = [user.userName];
			} else {
				players = [];
			}
		}
	});
</script>

<Drawer.Root bind:open>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-sm">
			<Drawer.Header>
				<Drawer.Title>{isEdit ? i18n.t.newGameDialog.editGame : i18n.t.newGameDialog.newGame}</Drawer.Title>
				<Drawer.Description>
					{isEdit ? i18n.t.newGameDialog.editSettings : i18n.t.newGameDialog.setupBankAndPlayers}
				</Drawer.Description>
			</Drawer.Header>

			<div class="px-4">
				{#if error}
					<div class="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
						<AlertCircle class="h-4 w-4" />
						{error}
					</div>
				{/if}

				<div class="grid gap-4 pb-4">
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

					<Separator />

					<!-- Memes Toggle -->
					<label
						class="group flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-[[data-state=checked]]:border-blue-600 has-[[data-state=checked]]:bg-blue-50 dark:has-[[data-state=checked]]:border-blue-900 dark:has-[[data-state=checked]]:bg-blue-950"
					>
						<Checkbox
							id="memes"
							bind:checked={enableMemes}
							class="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
						/>
						<div class="grid gap-1.5 font-normal">
							<p class="text-sm leading-none font-medium group-has-[[data-state=checked]]:text-blue-900 dark:group-has-[[data-state=checked]]:text-blue-100">{i18n.t.newGameDialog.enableMemes}</p>
							<p class="text-muted-foreground text-sm group-has-[[data-state=checked]]:text-blue-700 dark:group-has-[[data-state=checked]]:text-blue-300">{i18n.t.newGameDialog.memesDescription}</p>
						</div>
					</label>
				</div>
			</div>

			<Drawer.Footer>
				<Button onclick={handleSubmit} disabled={isSubmitting}>
					{#if isSubmitting}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
					{/if}
					{isEdit ? i18n.t.newGameDialog.updateGame : i18n.t.newGameDialog.createGame}
				</Button>
				<Drawer.Close class={buttonVariants({ variant: 'outline' })}>
					{i18n.t.newGameDialog.cancel}
				</Drawer.Close>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
