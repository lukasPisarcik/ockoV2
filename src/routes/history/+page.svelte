<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { GameWithPlayers } from '$lib/schemas';
	import { Calendar, Users, Wallet, Clock } from 'lucide-svelte';
	import { getI18n } from '$lib/i18n';

	const i18n = getI18n();
	let games = $state<GameWithPlayers[]>([]);

	onMount(() => {
		// Load games history from localStorage
		const historyData = localStorage.getItem('ocko_game_history');
		if (historyData) {
			try {
				games = JSON.parse(historyData);
			} catch (e) {
				console.error('Failed to load game history', e);
			}
		}

		// Also check current game
		const currentGame = localStorage.getItem('ocko_current_game');
		if (currentGame) {
			try {
				const game = JSON.parse(currentGame);
				// Add to history if not already there
				if (!games.some((g) => g._id === game._id)) {
					games = [game, ...games];
				}
			} catch (e) {
				console.error('Failed to load current game', e);
			}
		}
	});

	function formatDate(timestamp: number): string {
		const locale = i18n.language === 'sk' ? 'sk-SK' : 'en-US';
		return new Date(timestamp).toLocaleDateString(locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getGameResult(game: GameWithPlayers): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
		const totalPlayerValue = game.players.reduce((sum, p) => sum + p.value, 0);
		if (totalPlayerValue > 0) {
			return { label: `+${totalPlayerValue}€`, variant: 'default' };
		} else if (totalPlayerValue < 0) {
			return { label: `${totalPlayerValue}€`, variant: 'destructive' };
		}
		return { label: '0€', variant: 'secondary' };
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">{i18n.t.history.title}</h1>
	</div>

	{#if games.length === 0}
		<Card class="text-center py-12">
			<CardContent>
				<p class="text-xl text-muted-foreground mb-4">{i18n.t.history.noGamesYet}</p>
				<a href="/"><Button>{i18n.t.history.startNewGame}</Button></a>
			</CardContent>
		</Card>
	{:else}
		<div class="grid gap-4">
			{#each games as game (game._id)}
				{@const result = getGameResult(game)}
				<Card>
					<CardHeader class="pb-2">
						<div class="flex items-center justify-between">
							<CardTitle class="text-lg flex items-center gap-2">
								<Calendar class="h-4 w-4 text-muted-foreground" />
								{formatDate(game.startedAt)}
							</CardTitle>
							<Badge variant={result.variant}>{result.label}</Badge>
						</div>
						<CardDescription class="flex items-center gap-4">
							<span class="flex items-center gap-1">
								<Wallet class="h-3 w-3" />
								{i18n.t.history.bank}: {game.initialBank}€
							</span>
							<span class="flex items-center gap-1">
								<Users class="h-3 w-3" />
								{game.players.length} {i18n.t.history.players}
							</span>
							{#if !game.isActive}
								<span class="flex items-center gap-1">
									<Clock class="h-3 w-3" />
									{i18n.t.history.ended}
								</span>
							{:else}
								<Badge variant="outline" class="text-xs">{i18n.t.history.active}</Badge>
							{/if}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="flex flex-wrap gap-2">
							{#each game.players as player}
								<div
									class="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm"
								>
									<span class="font-medium">{player.name}</span>
									<span
										class:text-green-600={player.value > 0}
										class:text-red-600={player.value < 0}
									>
										{player.value > 0 ? '+' : ''}{player.value}€
									</span>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>
