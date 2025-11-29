<script lang="ts">
	import '../app.css';
	import { sanitizeInjection } from '$lib/utils/sanitize';
	import type { LayoutData } from './$types';
	import BackgroundGlow from '$lib/components/BackgroundGlow.svelte';
	import { navigating } from '$app/stores';
	import PostCardSkeleton from '$lib/components/PostCardSkeleton.svelte';
	import ArticleSkeleton from '$lib/components/ArticleSkeleton.svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const headInjections = $derived(data.injections?.head || []);
	const bodyStartInjections = $derived(data.injections?.body_start || []);
	const bodyEndInjections = $derived(data.injections?.body_end || []);

	// Determine which skeleton to show based on the target route
	let showSkeleton = $derived(!!$navigating);
	let isBlogRoute = $derived($navigating?.to?.route.id?.includes('/blog/[slug]'));
</script>

<svelte:head>
	<link rel="icon" href="%sveltekit.assets%/favicon.png" />
	<link rel="icon" type="image/svg+xml" href="%sveltekit.assets%/favicon.svg" />
	<link rel="apple-touch-icon" href="%sveltekit.assets%/favicon.png" />

	<!-- HEAD INJECTIONS -->
	{#each headInjections as injection}
		{@html sanitizeInjection(injection.content)}
	{/each}
</svelte:head>

<!-- BODY START INJECTIONS -->
{#each bodyStartInjections as injection}
	{@html sanitizeInjection(injection.content)}
{/each}

<BackgroundGlow />

{#if showSkeleton}
	{#if isBlogRoute}
		<ArticleSkeleton />
	{:else}
		<!-- Default/Home skeleton: just a list of cards -->
		<div class="max-w-screen-xl mx-auto px-6 py-8 max-w-prose">
			<PostCardSkeleton />
			<PostCardSkeleton />
			<PostCardSkeleton />
		</div>
	{/if}
{:else}
	{@render children()}
{/if}

<!-- BODY END INJECTIONS -->
{#each bodyEndInjections as injection}
	{@html sanitizeInjection(injection.content)}
{/each}
