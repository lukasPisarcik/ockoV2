<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { GameWithPlayers } from '$lib/schemas';
	import { Gamepad2, Users, Coins, Trophy, TrendingUp, Loader2 } from 'lucide-svelte';
	import { getI18n } from '$lib/i18n';
	import { getUser } from '$lib/stores';
	import { getConvexClient } from '$lib/convex';
	import { api } from '@convex/_generated/api';
	import { log } from '$lib/utils';
	import { Chart, Svg, Axis, Spline, Highlight, Points } from 'layerchart';
	import { scaleOrdinal } from 'd3-scale';
	import { flatGroup } from 'd3-array';

	const i18n = getI18n();
	const user = getUser();

	let games = $state<GameWithPlayers[]>([]);
	let isLoading = $state(true);
	let unsubscribe: (() => void) | null = null;

	// Player stats aggregated across all games
	type PlayerStats = {
		name: string;
		gamesPlayed: number;
		totalBalance: number;
		avgPerGame: number;
	};

	let playerStats = $derived(() => {
		const statsMap = new Map<string, { gamesPlayed: number; totalBalance: number }>();

		for (const game of games) {
			for (const player of game.players) {
				const existing = statsMap.get(player.name) || { gamesPlayed: 0, totalBalance: 0 };
				statsMap.set(player.name, {
					gamesPlayed: existing.gamesPlayed + 1,
					totalBalance: existing.totalBalance + player.value
				});
			}
		}

		const stats: PlayerStats[] = [];
		for (const [name, data] of statsMap) {
			stats.push({
				name,
				gamesPlayed: data.gamesPlayed,
				totalBalance: data.totalBalance,
				avgPerGame: data.gamesPlayed > 0 ? Math.round(data.totalBalance / data.gamesPlayed) : 0
			});
		}

		// Sort by total balance descending
		return stats.sort((a, b) => b.totalBalance - a.totalBalance);
	});

	// Chart colors
	const chartColors = [
		'hsl(221, 83%, 53%)', // blue
		'hsl(142, 76%, 36%)', // green
		'hsl(262, 83%, 58%)', // purple
		'hsl(24, 95%, 53%)', // orange
		'hsl(339, 90%, 51%)', // pink
		'hsl(173, 80%, 40%)', // teal
		'hsl(47, 96%, 53%)', // yellow
		'hsl(0, 84%, 60%)' // red
	];

	// Historical balance data for line chart
	let historicalData = $derived(() => {
		// Sort games by date (oldest first)
		const sortedGames = [...games].sort((a, b) => {
			const dateA = a.startedAt || 0;
			const dateB = b.startedAt || 0;
			return dateA - dateB;
		});

		// Track cumulative balance for each player
		const cumulativeBalances = new Map<string, number>();
		const dataPoints: { gameIndex: number; player: string; balance: number }[] = [];

		// Add starting point (0) for all players
		const allPlayers = new Set<string>();
		for (const game of sortedGames) {
			for (const player of game.players) {
				allPlayers.add(player.name);
			}
		}

		// Initialize all players at 0
		for (const playerName of allPlayers) {
			cumulativeBalances.set(playerName, 0);
			dataPoints.push({ gameIndex: 0, player: playerName, balance: 0 });
		}

		// Build cumulative data
		sortedGames.forEach((game, index) => {
			const gameIndex = index + 1;

			// Update balances for players in this game
			for (const player of game.players) {
				const current = cumulativeBalances.get(player.name) || 0;
				cumulativeBalances.set(player.name, current + player.value);
			}

			// Add data point for each player at this game
			for (const playerName of allPlayers) {
				dataPoints.push({
					gameIndex,
					player: playerName,
					balance: cumulativeBalances.get(playerName) || 0
				});
			}
		});

		return dataPoints;
	});

	// Get unique players for the legend
	let uniquePlayers = $derived(() => {
		const players = new Set<string>();
		for (const game of games) {
			for (const player of game.players) {
				players.add(player.name);
			}
		}
		return Array.from(players);
	});

	// Color scale for players
	let colorScale = $derived(() => {
		return scaleOrdinal<string>().domain(uniquePlayers()).range(chartColors);
	});

	// Computed stats
	let totalGames = $derived(games.length);
	let totalPlayers = $derived(playerStats().length);
	let totalMoneyMoved = $derived(
		games.reduce((sum, game) => {
			return sum + game.players.reduce((s, p) => s + Math.abs(p.value), 0);
		}, 0)
	);

	onMount(() => {
		const initId = crypto.randomUUID();
		log.info({ initId }, 'StatsPage: Mounting');

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

		const convex = getConvexClient();
		if (!convex) return;

		unsubscribe = convex.onUpdate(api.games.listByUser, { userId: user.userId }, (result) => {
			games = (result || []).map((g) => ({
				...g,
				enableMemes: g.enableMemes ?? true
			}));
			isLoading = false;
		});
	}
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">{i18n.t.stats.title}</h1>

	{#if isLoading}
		<Card class="text-center py-12">
			<CardContent class="flex flex-col items-center gap-4">
				<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				<p class="text-muted-foreground">{i18n.t.common.loading}</p>
			</CardContent>
		</Card>
	{:else}
		<!-- Summary Cards -->
		<div class="grid gap-4 sm:grid-cols-3">
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{i18n.t.stats.totalGames}</CardTitle>
					<Gamepad2 class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{totalGames}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{i18n.t.stats.totalPlayers}</CardTitle>
					<Users class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{totalPlayers}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{i18n.t.stats.totalMoneyMoved}</CardTitle>
					<Coins class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{totalMoneyMoved}€</div>
				</CardContent>
			</Card>
		</div>

		{#if playerStats().length > 0}
			<!-- Player Leaderboard -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Trophy class="h-5 w-5" />
						{i18n.t.stats.playerLeaderboard}
					</CardTitle>
					<CardDescription>{i18n.t.stats.allPlayersStats}</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead class="w-12">{i18n.t.stats.rank}</TableHead>
								<TableHead>{i18n.t.stats.player}</TableHead>
								<TableHead class="text-center">{i18n.t.stats.gamesPlayed}</TableHead>
								<TableHead class="text-right">{i18n.t.stats.balance}</TableHead>
								<TableHead class="text-right">{i18n.t.stats.avgPerGame}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each playerStats() as player, index}
								<TableRow>
									<TableCell class="font-medium">
										{#if index === 0}
											<Badge variant="default">1</Badge>
										{:else if index === 1}
											<Badge variant="secondary">2</Badge>
										{:else if index === 2}
											<Badge variant="outline">3</Badge>
										{:else}
											<span class="text-muted-foreground">{index + 1}</span>
										{/if}
									</TableCell>
									<TableCell class="font-medium">{player.name}</TableCell>
									<TableCell class="text-center">{player.gamesPlayed}</TableCell>
									<TableCell class="text-right">
										<span
											class:text-green-600={player.totalBalance > 0}
											class:text-red-600={player.totalBalance < 0}
										>
											{player.totalBalance >= 0 ? '+' : ''}{player.totalBalance}€
										</span>
									</TableCell>
									<TableCell class="text-right">
										<span class="text-muted-foreground">
											{player.avgPerGame >= 0 ? '+' : ''}{player.avgPerGame}€
										</span>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<!-- Historical Balance Chart -->
			{#if games.length > 0}
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<TrendingUp class="h-5 w-5" />
							{i18n.t.stats.balanceChart}
						</CardTitle>
						<CardDescription>{i18n.t.stats.balanceChartDesc}</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="h-[300px] w-full chart-container">
							<Chart
								data={historicalData()}
								x="gameIndex"
								y="balance"
								yDomain={[null, null]}
								yNice
								padding={{ left: 48, bottom: 30, right: 16, top: 16 }}
							>
								<Svg>
									<Axis placement="left" grid rule format={(v: number) => `${v}€`} />
									<Axis placement="bottom" format={(v: number) => (v === 0 ? 'Start' : `#${v}`)} />
									{#each flatGroup(historicalData(), (d: { gameIndex: number; player: string; balance: number }) => d.player) as [player, data]}
										<Spline {data} stroke={colorScale()(player)} strokeWidth={2} />
										<Points
											{data}
											r={4}
											fill={colorScale()(player)}
											class="opacity-0 hover:opacity-100"
										/>
									{/each}
									<Highlight points lines />
								</Svg>
							</Chart>
						</div>
						<!-- Legend -->
						<div class="flex flex-wrap gap-4 mt-4 justify-center">
							{#each uniquePlayers() as player}
								<div class="flex items-center gap-2">
									<div
										class="h-3 w-3 rounded-full"
										style="background-color: {colorScale()(player)}"
									></div>
									<span class="text-sm">{player}</span>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}
		{:else}
			<Card class="text-center py-12">
				<CardContent>
					<p class="text-muted-foreground">
						{i18n.t.stats.noData}
					</p>
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>

<style>
	.chart-container :global(svg) {
		shape-rendering: crispEdges;
	}
	.chart-container :global(text) {
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	.chart-container :global(.spline) {
		shape-rendering: geometricPrecision;
	}
</style>
