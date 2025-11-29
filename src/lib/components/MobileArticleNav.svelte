<script lang="ts">
	import { List, ChevronLeft, Share2, ArrowUp } from 'lucide-svelte';
	import { Button } from "$lib/components/ui/button";
	import * as Sheet from "$lib/components/ui/sheet";
	import type { TocItem } from '$lib/utils/toc';

	let { toc, activeHeadingId, title }: { toc: TocItem[]; activeHeadingId: string; title: string } = $props();

	let open = $state(false);
	let showBar = $state(true);
	let lastScrollY = 0;

	// Hide bar on scroll down, show on scroll up
	function handleScroll() {
		const currentScrollY = window.scrollY;
		if (currentScrollY > lastScrollY && currentScrollY > 100) {
			showBar = false;
		} else {
			showBar = true;
		}
		lastScrollY = currentScrollY;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleShare() {
		if (navigator.share) {
			navigator.share({
				title: title,
				url: window.location.href
			}).catch(console.error);
		} else {
			// Fallback: Copy to clipboard
			navigator.clipboard.writeText(window.location.href);
			// Ideally show a toast here
		}
	}
</script>

<svelte:window onscroll={handleScroll} />

<div
	class="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-lg transition-transform duration-300 md:hidden pb-safe"
	class:translate-y-full={!showBar}
>
	<div class="flex h-14 items-center justify-between px-4">
		<!-- Left: Home/Back -->
		<Button variant="ghost" size="icon" href="/" aria-label="Back to home">
			<ChevronLeft class="h-5 w-5" />
		</Button>

		<!-- Center: Actions -->
		<div class="flex items-center gap-2">
			<Button variant="ghost" size="icon" onclick={handleShare} aria-label="Share post">
				<Share2 class="h-4 w-4" />
			</Button>
			<Button variant="ghost" size="icon" onclick={scrollToTop} aria-label="Scroll to top">
				<ArrowUp class="h-4 w-4" />
			</Button>
		</div>

		<!-- Right: TOC Trigger -->
		<Sheet.Root bind:open>
			<Sheet.Trigger>
				{#snippet child({ props })}
					<Button variant="ghost" size="icon" {...props} aria-label="Table of Contents">
						<List class="h-5 w-5" />
					</Button>
				{/snippet}
			</Sheet.Trigger>
			<Sheet.Content side="bottom" class="max-h-[80vh]">
				<Sheet.Header class="mb-4 text-left">
					<Sheet.Title>Table of Contents</Sheet.Title>
					<Sheet.Description>Navigate to a section</Sheet.Description>
				</Sheet.Header>
				<div class="overflow-y-auto pb-8">
					<nav class="flex flex-col space-y-1">
						{#each toc as item (item.id)}
							<a
								href={`#${item.id}`}
								onclick={() => open = false}
								class="block py-2 text-sm transition-colors hover:text-accent-strong"
								class:pl-4={item.level === 3}
								class:font-medium={item.level === 2}
								class:text-accent={activeHeadingId === item.id}
								class:text-muted-foreground={activeHeadingId !== item.id}
								style="padding-left: {item.level === 3 ? '1rem' : '0'};"
							>
								{item.text}
							</a>
						{/each}
					</nav>
				</div>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</div>

<style>
	/* Support for iOS safe area (iPhone X+ bottom bar) */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom, 20px);
	}
</style>
