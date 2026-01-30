<script lang="ts">
	import type { MemeType } from '$lib/schemas';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { getI18n } from '$lib/i18n';

	type Props = {
		open: boolean;
		memeType: MemeType;
		playerName?: string;
		onClose: () => void;
	};

	let { open = $bindable(false), memeType, playerName = '', onClose }: Props = $props();

	const i18n = getI18n();

	const winGifs = [
		'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eW9wd2dhOTY3emJ5b2cxdmd5aHUxNWF6eXIwM3Vsam91ZGg2MGdncyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/RQU6LwKmZheaDL13uA/giphy.gif',
		'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjg2c25wZDB0d3h2dGxzODRkZ3oyNWh3anZ2cHpkZTJmbnhwY2hmcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/h0MTqLyvgG0Ss/giphy.gif',
		'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjg2c25wZDB0d3h2dGxzODRkZ3oyNWh3anZ2cHpkZTJmbnhwY2hmcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/X8omQqfFyeq1a/giphy.gif'
	];

	const loseGifs = [
		'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjVtdzFmenh2azg2Y2E0OHo1dW9uMnhicTZ6Mnh4ZmIyMTl2c2xwcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8nM6YNtvjuezzD7DNh/giphy.gif',
		'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExamNrZTNya216Mm0zNDJ4ODIzZWQ5bjU5bW1mejBiOW12cXBzMjBoMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jv6DIneawn5AW7ZUrq/giphy.gif',
		'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjNhdmk1dTR4NHlrMnllN3JyMnJkZ2wyOTdiZWEwejdhMzB3ZjNkcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2Dqy9N348V3dl8gSHD/giphy.gif'
	];

	function getRandomGif(gifs: string[]): string {
		return gifs[Math.floor(Math.random() * gifs.length)];
	}

	let currentGif = $state<string | null>(null);

	$effect(() => {
		if (open) {
			if (memeType === 'WIN') {
				currentGif = getRandomGif(winGifs);
			} else if (memeType === 'LOSE') {
				currentGif = getRandomGif(loseGifs);
			} else {
				currentGif = null;
			}
		}
	});

	const memeConfig = $derived(() => {
		const configs = {
			BANK: {
				title: i18n.t.meme.bankEmpty,
				message: i18n.t.meme.bankEmptyMessage,
				emoji: '🏦💸'
			},
			WIN: {
				title: playerName || i18n.t.meme.playersWon,
				emoji: '🎉🤑'
			},
			LOSE: {
				title: playerName || i18n.t.meme.playersLost,
				emoji: '😭💀'
			}
		};
		return configs[memeType];
	});
</script>

<Dialog bind:open>
	<DialogContent class="sm:max-w-md text-center">
		<DialogHeader>
			<DialogTitle class="text-2xl">{memeConfig().title}</DialogTitle>
		</DialogHeader>

		<div class="py-4">
			{#if currentGif}
				<img src={currentGif} alt="meme" class="w-full max-h-64 object-contain rounded-lg" />
			{:else}
				{@const config = memeConfig()}
				<div class="text-6xl mb-4">{config.emoji}</div>
				{#if 'message' in config}
					<p class="text-lg text-muted-foreground">{config.message}</p>
				{/if}
			{/if}
		</div>

		<DialogFooter class="justify-center">
			<Button onclick={onClose}>{i18n.t.meme.continue}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
