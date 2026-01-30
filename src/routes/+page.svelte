<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Gamepad2, History, BarChart3, Play, Heart, Coffee, Github, AlertTriangle, Instagram, Linkedin, Copy, Check, Info } from 'lucide-svelte';
	import NewGameDialog from '$lib/components/NewGameDialog.svelte';
	import WelcomeDialog from '$lib/components/WelcomeDialog.svelte';
	import { getI18n } from '$lib/i18n';
	import { getUser } from '$lib/stores';

	const i18n = getI18n();
	const user = getUser();

	let showNewGameDialog = $state(false);
	let copied = $state(false);

	// Show welcome dialog if user has no name set
	let showWelcomeDialog = $derived(user.isReady && !user.userName);

	const IBAN = 'CZ3555000000005503226004';

	async function copyIban() {
		await navigator.clipboard.writeText(IBAN);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Hero Section -->
	<div class="text-center space-y-4 py-8">
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight">
			{i18n.t.home.welcomeBack}{user.userName ? `, ${user.userName}` : ''} 👋
		</h1>
		<p class="text-lg text-muted-foreground max-w-md mx-auto">
			{i18n.t.home.description}
		</p>
	</div>

	<!-- Disclaimer -->
	<Alert variant="warning">
		<AlertTriangle class="h-4 w-4" />
		<AlertDescription>
			{i18n.t.about.disclaimer}
		</AlertDescription>
	</Alert>

	<!-- Player names tip -->
	<Alert>
		<Info class="h-4 w-4" />
		<AlertDescription>
			{i18n.t.home.playerNamesTip}
		</AlertDescription>
	</Alert>

	<!-- Main Actions -->
	<Card>
		<CardHeader>
			<CardTitle>{i18n.t.home.startPlaying}</CardTitle>
			<CardDescription>{i18n.t.home.createOrContinue}</CardDescription>
		</CardHeader>
		<CardContent class="flex flex-col sm:flex-row gap-3">
			<div class="flex-1">
				<Button size="lg" class="w-full gap-2" onclick={() => (showNewGameDialog = true)}>
					<Gamepad2 class="h-5 w-5" />
					{i18n.t.home.newGame}
				</Button>
			</div>
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

	<!-- Support -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Coffee class="h-5 w-5 text-amber-600" />
				{i18n.t.about.supportProject}
			</CardTitle>
			<CardDescription>
				{i18n.t.about.supportDescription}
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-muted-foreground">
				{i18n.t.about.shareWinnings}
			</p>

			<div class="rounded-lg border bg-muted/50 p-4 space-y-3">
				<div class="grid gap-2 text-sm">
					<div class="flex items-center justify-between gap-2">
						<span class="text-muted-foreground">{i18n.t.about.iban}:</span>
						<div class="flex items-center gap-2">
							<span class="font-mono font-medium text-xs sm:text-sm">{IBAN}</span>
							<Button variant="ghost" size="icon" class="h-7 w-7" onclick={copyIban}>
								{#if copied}
									<Check class="h-4 w-4 text-green-500" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</Button>
						</div>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">{i18n.t.about.recipient}:</span>
						<span class="font-medium">{i18n.t.about.creatorName}</span>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Creator -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Heart class="h-5 w-5 text-red-500" />
				{i18n.t.about.aboutCreator}
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p>
				{i18n.t.about.creatorDescription} <strong>{i18n.t.about.creatorName}</strong>
			</p>
			<div class="flex flex-wrap gap-2">
				<a
					href="https://github.com/lukasPisarcik"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Button variant="outline" size="sm" class="gap-2">
						<Github class="h-4 w-4" />
						GitHub
					</Button>
				</a>
				<a
					href="https://www.instagram.com/lukaspisarcik/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Button variant="outline" size="sm" class="gap-2">
						<Instagram class="h-4 w-4" />
						Instagram
					</Button>
				</a>
				<a
					href="https://www.linkedin.com/in/luk%C3%A1%C5%A1-pisar%C4%8D%C3%ADk-0885a61b8/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Button variant="outline" size="sm" class="gap-2">
						<Linkedin class="h-4 w-4" />
						LinkedIn
					</Button>
				</a>
			</div>
		</CardContent>
	</Card>
</div>

<NewGameDialog bind:open={showNewGameDialog} />
<WelcomeDialog open={showWelcomeDialog} />
