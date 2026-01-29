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
		onClose: () => void;
	};

	let { open = $bindable(false), memeType, onClose }: Props = $props();

	const i18n = getI18n();

	const memeConfig = $derived({
		BANK: {
			title: i18n.t.meme.bankEmpty,
			message: i18n.t.meme.bankEmptyMessage,
			emoji: '🏦💸'
		},
		WIN: {
			title: i18n.t.meme.playersWon,
			message: i18n.t.meme.playersWonMessage,
			emoji: '🎉🤑'
		},
		LOSE: {
			title: i18n.t.meme.playersLost,
			message: i18n.t.meme.playersLostMessage,
			emoji: '😭💀'
		}
	}[memeType]);
</script>

<Dialog bind:open>
	<DialogContent class="sm:max-w-md text-center">
		<DialogHeader>
			<DialogTitle class="text-2xl">{memeConfig.title}</DialogTitle>
		</DialogHeader>

		<div class="py-8">
			<div class="text-6xl mb-4">{memeConfig.emoji}</div>
			<p class="text-lg text-muted-foreground">{memeConfig.message}</p>
		</div>

		<DialogFooter class="justify-center">
			<Button onclick={onClose}>{i18n.t.meme.continue}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
