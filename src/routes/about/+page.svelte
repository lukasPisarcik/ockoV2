<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Github, Heart, Coffee, ExternalLink } from 'lucide-svelte';
	import { getI18n } from '$lib/i18n';

	const i18n = getI18n();
</script>

<div class="space-y-8 max-w-2xl mx-auto">
	<div class="text-center space-y-4">
		<h1 class="text-3xl font-bold">{i18n.t.about.title}</h1>
		<p class="text-lg text-muted-foreground">
			{i18n.t.about.subtitle}
		</p>
	</div>

	<!-- About the App -->
	<Card>
		<CardHeader>
			<CardTitle>{i18n.t.about.whatIsOcko}</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p>
				{i18n.t.about.ockoDescription}
			</p>
			<p class="text-muted-foreground text-sm">
				{i18n.t.about.disclaimer}
			</p>
		</CardContent>
	</Card>

	<!-- Features -->
	<Card>
		<CardHeader>
			<CardTitle>{i18n.t.about.features}</CardTitle>
		</CardHeader>
		<CardContent>
			<ul class="space-y-2">
				<li class="flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-primary"></span>
					{i18n.t.about.featureList.createGames}
				</li>
				<li class="flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-primary"></span>
					{i18n.t.about.featureList.quickAdjust}
				</li>
				<li class="flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-primary"></span>
					{i18n.t.about.featureList.manualEdit}
				</li>
				<li class="flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-primary"></span>
					{i18n.t.about.featureList.gameHistory}
				</li>
				<li class="flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-primary"></span>
					{i18n.t.about.featureList.statsCharts}
				</li>
				<li class="flex items-center gap-2">
					<span class="h-2 w-2 rounded-full bg-primary"></span>
					{i18n.t.about.featureList.multiDevice}
				</li>
			</ul>
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
				{i18n.t.about.creatorDescription} <strong>{i18n.t.about.creatorName}</strong> {i18n.t.about.enthusiast}
			</p>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" class="gap-2">
					<a
						href="https://github.com/lukasPisarcik"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2"
					>
						<Github class="h-4 w-4" />
						GitHub
						<ExternalLink class="h-3 w-3" />
					</a>
				</Button>
			</div>
		</CardContent>
	</Card>

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
				{i18n.t.about.supportDetails}
			</p>

			<div class="rounded-lg border bg-muted/50 p-4 space-y-3">
				<div class="grid gap-2 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">{i18n.t.about.iban}:</span>
						<span class="font-mono font-medium">SK00 0000 0000 0000 0000 0000</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">{i18n.t.about.recipient}:</span>
						<span class="font-medium">{i18n.t.about.creatorName}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">{i18n.t.about.message}:</span>
						<span class="font-medium">{i18n.t.about.supportMessage}</span>
					</div>
				</div>
			</div>

			<p class="text-xs text-muted-foreground">
				{i18n.t.about.ibanNote}
			</p>
		</CardContent>
	</Card>

	<!-- Tech Stack -->
	<Card>
		<CardHeader>
			<CardTitle>{i18n.t.about.techStack}</CardTitle>
			<CardDescription>{i18n.t.about.builtWith}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-2">
				{#each ['SvelteKit', 'Svelte 5', 'TypeScript', 'Tailwind CSS', 'Convex', 'Bun', 'shadcn-svelte'] as tech}
					<span class="rounded-full bg-muted px-3 py-1 text-sm">{tech}</span>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Version -->
	<div class="text-center text-sm text-muted-foreground">
		<p>{i18n.t.common.appName} {i18n.t.about.version} 2.0.0</p>
		<p>2024 {i18n.t.about.creatorName}.</p>
	</div>
</div>
