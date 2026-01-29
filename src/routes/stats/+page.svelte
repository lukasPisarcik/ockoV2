<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { GameWithPlayers } from '$lib/schemas';
	import { Chart, registerables } from 'chart.js';
	import { TrendingUp, TrendingDown, Gamepad2, DollarSign } from 'lucide-svelte';
	import { getI18n } from '$lib/i18n';

	Chart.register(...registerables);

	const i18n = getI18n();

	let games = $state<GameWithPlayers[]>([]);
	let spendingChartCanvas = $state<HTMLCanvasElement | null>(null);
	let winLossChartCanvas = $state<HTMLCanvasElement | null>(null);
	let spendingChart: Chart | null = null;
	let winLossChart: Chart | null = null;

	// Computed stats
	let totalGames = $derived(games.length);
	let totalSpent = $derived(
		games.reduce((sum, game) => {
			const playerTotal = game.players.reduce((s, p) => s + p.value, 0);
			return sum + (playerTotal < 0 ? Math.abs(playerTotal) : 0);
		}, 0)
	);
	let totalWon = $derived(
		games.reduce((sum, game) => {
			const playerTotal = game.players.reduce((s, p) => s + p.value, 0);
			return sum + (playerTotal > 0 ? playerTotal : 0);
		}, 0)
	);
	let netResult = $derived(totalWon - totalSpent);

	onMount(() => {
		// Load games history
		const historyData = localStorage.getItem('ocko_game_history');
		if (historyData) {
			try {
				games = JSON.parse(historyData);
			} catch (e) {
				console.error('Failed to load game history', e);
			}
		}

		const currentGame = localStorage.getItem('ocko_current_game');
		if (currentGame) {
			try {
				const game = JSON.parse(currentGame);
				if (!games.some((g) => g._id === game._id)) {
					games = [game, ...games];
				}
			} catch (e) {
				console.error('Failed to load current game', e);
			}
		}

		return () => {
			spendingChart?.destroy();
			winLossChart?.destroy();
		};
	});

	// Create charts when data is loaded and canvas is ready
	$effect(() => {
		if (spendingChartCanvas && games.length > 0) {
			spendingChart?.destroy();

			const locale = i18n.language === 'sk' ? 'sk-SK' : 'en-US';

			// Prepare data for spending over time
			const sortedGames = [...games].sort((a, b) => a.startedAt - b.startedAt);
			const labels = sortedGames.map((g) =>
				new Date(g.startedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
			);
			const cumulativeSpending = sortedGames.reduce<number[]>((acc, game) => {
				const playerTotal = game.players.reduce((s, p) => s + p.value, 0);
				const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
				acc.push(lastValue + playerTotal);
				return acc;
			}, []);

			spendingChart = new Chart(spendingChartCanvas, {
				type: 'line',
				data: {
					labels,
					datasets: [
						{
							label: i18n.t.stats.cumulativeResult,
							data: cumulativeSpending,
							borderColor: 'hsl(221.2 83.2% 53.3%)',
							backgroundColor: 'hsl(221.2 83.2% 53.3% / 0.1)',
							fill: true,
							tension: 0.3
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						legend: {
							display: false
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							title: {
								display: true,
								text: i18n.t.stats.result
							}
						}
					}
				}
			});
		}
	});

	$effect(() => {
		if (winLossChartCanvas && games.length > 0) {
			winLossChart?.destroy();

			const wins = games.filter((g) => g.players.reduce((s, p) => s + p.value, 0) > 0).length;
			const losses = games.filter((g) => g.players.reduce((s, p) => s + p.value, 0) < 0).length;
			const draws = games.filter((g) => g.players.reduce((s, p) => s + p.value, 0) === 0).length;

			winLossChart = new Chart(winLossChartCanvas, {
				type: 'doughnut',
				data: {
					labels: [i18n.t.stats.wins, i18n.t.stats.losses, i18n.t.stats.draws],
					datasets: [
						{
							data: [wins, losses, draws],
							backgroundColor: [
								'hsl(142.1 76.2% 36.3%)',
								'hsl(0 84.2% 60.2%)',
								'hsl(217.2 32.6% 50%)'
							]
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'bottom'
						}
					}
				}
			});
		}
	});
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">{i18n.t.stats.title}</h1>

	<!-- Summary Cards -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
				<CardTitle class="text-sm font-medium">{i18n.t.stats.totalWon}</CardTitle>
				<TrendingUp class="h-4 w-4 text-green-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-600">+{totalWon}€</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">{i18n.t.stats.totalLost}</CardTitle>
				<TrendingDown class="h-4 w-4 text-red-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">-{totalSpent}€</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">{i18n.t.stats.netResult}</CardTitle>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div
					class="text-2xl font-bold"
					class:text-green-600={netResult > 0}
					class:text-red-600={netResult < 0}
				>
					{netResult >= 0 ? '+' : ''}{netResult}€
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Charts -->
	{#if games.length > 0}
		<div class="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{i18n.t.stats.resultsOverTime}</CardTitle>
					<CardDescription>{i18n.t.stats.cumulativeProgress}</CardDescription>
				</CardHeader>
				<CardContent>
					<canvas bind:this={spendingChartCanvas}></canvas>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{i18n.t.stats.winLossRatio}</CardTitle>
					<CardDescription>{i18n.t.stats.gameResultsDistribution}</CardDescription>
				</CardHeader>
				<CardContent class="flex justify-center">
					<div class="w-64 h-64">
						<canvas bind:this={winLossChartCanvas}></canvas>
					</div>
				</CardContent>
			</Card>
		</div>
	{:else}
		<Card class="text-center py-12">
			<CardContent>
				<p class="text-muted-foreground">
					{i18n.t.stats.noData}
				</p>
			</CardContent>
		</Card>
	{/if}
</div>
