<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { GameWithPlayers } from '$lib/schemas';
	import { Calendar, Users, Wallet, Clock, Loader2 } from 'lucide-svelte';
	import { getI18n } from '$lib/i18n';
	import { getUser } from '$lib/stores';
	import { getConvexClient } from '$lib/convex';
	import { api } from '@convex/_generated/api';
	import { log } from '$lib/utils';

	const i18n = getI18n();
	const user = getUser();
	const convex = getConvexClient();

	let games = $state<GameWithPlayers[]>([]);
	let isLoading = $state(true);
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'HistoryPage: Mounting');

		// Wait for user to be ready, then load games
		const checkUser = setInterval(() => {
			if (user.isReady && user.userId) {
				clearInterval(checkUser);
				loadGames();
			}
		}, 100);

		// Timeout after 5 seconds
		setTimeout(() => {
			clearInterval(checkUser);
			isLoading = false;
		}, 5000);

		return () => {
			clearInterval(checkUser);
			if (unsubscribe) unsubscribe();
		};
	});

	function loadGames() {
		if (!user.userId) return;

		unsubscribe = convex.onUpdate(api.games.listByUser, { userId: user.userId }, (result) => {
			games = (result || []).map(g => ({
				...g,
				enableMemes: g.enableMemes ?? true
			}));
			isLoading = false;
		});
	}

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

	{#if isLoading}
		<Card class="text-center py-12">
			<CardContent class="flex flex-col items-center gap-4">
				<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				<p class="text-muted-foreground">{i18n.t.common.loading}</p>
			</CardContent>
		</Card>
	{:else if games.length === 0}
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
