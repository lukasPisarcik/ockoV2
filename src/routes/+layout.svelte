<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '../app.css';
	import { Button } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { Home, Gamepad2, History, BarChart3, Menu } from 'lucide-svelte';
	import { getI18n } from '$lib/i18n';
	import { getTheme, UserStore, setUser } from '$lib/stores';

	let { children } = $props();

	const i18n = getI18n();
	const theme = getTheme();
	const user = new UserStore();
	setUser(user);

	let menuOpen = $state(false);

	// Navigation items with translation keys
	const navItems = $derived([
		{ href: '/', label: i18n.t.nav.home, icon: Home },
		{ href: '/game', label: i18n.t.nav.game, icon: Gamepad2 },
		{ href: '/history', label: i18n.t.nav.history, icon: History },
		{ href: '/stats', label: i18n.t.nav.stats, icon: BarChart3 }
	]);

	// Close menu on navigation
	$effect(() => {
		$page.url.pathname;
		menuOpen = false;
	});

	onMount(() => {
		theme.init();
		user.init();
		return () => {
			theme.dispose();
			user.dispose();
		};
	});
</script>

<div class="min-h-dvh flex flex-col">
	<!-- Header -->
	<header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="flex h-14 items-center justify-between px-4 max-w-screen-lg mx-auto w-full">
			<a href="/" class="flex items-center gap-2">
				<img src="/logo.png" alt="Ocko" class="h-8 w-8" />
				<span class="text-xl font-bold">{i18n.t.common.appName}</span>
			</a>

			<!-- Desktop nav -->
			<nav class="hidden md:flex items-center space-x-1">
				{#each navItems as item}
					<a href={item.href}>
						<Button 
							variant={$page.url.pathname === item.href ? 'secondary' : 'ghost'} 
							size="sm" 
							class="gap-2"
						>
							<item.icon class="h-4 w-4" />
							{item.label}
						</Button>
					</a>
				{/each}
			</nav>

			<div class="flex items-center gap-1">
				<LanguageSwitcher />
				<ThemeSwitcher />
				<!-- Mobile menu button -->
				<Button variant="ghost" size="icon" class="md:hidden" onclick={() => (menuOpen = true)}>
					<Menu class="h-5 w-5" />
				</Button>
			</div>
		</div>
	</header>

	<!-- Mobile side menu -->
	<Sheet bind:open={menuOpen}>
		<SheetContent side="right">
			<SheetHeader>
				<SheetTitle class="flex items-center gap-2">
					<img src="/logo.png" alt="Ocko" class="h-6 w-6" />
					{i18n.t.common.appName}
				</SheetTitle>
			</SheetHeader>
			<nav class="flex flex-col gap-2 mt-6">
				{#each navItems as item}
					<a href={item.href}>
						<Button 
							variant={$page.url.pathname === item.href ? 'secondary' : 'ghost'} 
							class="w-full justify-start gap-3"
						>
							<item.icon class="h-5 w-5" />
							{item.label}
						</Button>
					</a>
				{/each}
			</nav>
		</SheetContent>
	</Sheet>

	<!-- Main content -->
	<main class="flex-1 px-4 py-6 max-w-screen-lg mx-auto w-full">
		{@render children()}
	</main>
</div>
