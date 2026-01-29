<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Gamepad2, History, BarChart3, Play } from 'lucide-svelte';
	import NewGameDialog from '$lib/components/NewGameDialog.svelte';
	import { getI18n } from '$lib/i18n';

	const i18n = getI18n();
	let showNewGameDialog = $state(false);
</script>

<div class="flex flex-col gap-6">
	<!-- Hero Section -->
	<div class="text-center space-y-4 py-8">
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight">{i18n.t.home.welcome}</h1>
		<p class="text-lg text-muted-foreground max-w-md mx-auto">
			{i18n.t.home.description}
		</p>
	</div>

	<!-- Main Actions -->
	<Card>
		<CardHeader>
			<CardTitle>{i18n.t.home.startPlaying}</CardTitle>
			<CardDescription>{i18n.t.home.createOrContinue}</CardDescription>
		</CardHeader>
		<CardContent class="flex flex-col sm:flex-row gap-3">
			<Button size="lg" class="flex-1 gap-2" onclick={() => (showNewGameDialog = true)}>
				<Gamepad2 class="h-5 w-5" />
				{i18n.t.home.newGame}
			</Button>
			<a href="/game" class="flex-1">
				<Button variant="outline" size="lg" class="w-full gap-2">
					<Play class="h-5 w-5" />
					{i18n.t.home.continue}
				</Button>
			</a>
		</CardContent>
	</Card>

	<!-- Quick Links -->
	<div class="grid grid-cols-2 gap-3">
		<a href="/history">
			<Card class="h-full hover:bg-muted/50 transition-colors cursor-pointer">
				<CardContent class="flex flex-col items-center justify-center gap-3 py-6">
					<History class="h-8 w-8 text-muted-foreground" />
					<span class="font-medium text-center">{i18n.t.nav.history}</span>
				</CardContent>
			</Card>
		</a>
		<a href="/stats">
			<Card class="h-full hover:bg-muted/50 transition-colors cursor-pointer">
				<CardContent class="flex flex-col items-center justify-center gap-3 py-6">
					<BarChart3 class="h-8 w-8 text-muted-foreground" />
					<span class="font-medium text-center">{i18n.t.nav.stats}</span>
				</CardContent>
			</Card>
		</a>
	</div>
</div>

<NewGameDialog bind:open={showNewGameDialog} />
