<script lang="ts">
	import type { PageData } from './$types';
    import ThemeRenderer from '$lib/components/ThemeRenderer.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>EdgePress - Blog at the Edge</title>
	<meta name="description" content="A serverless blog platform powered by Cloudflare" />
</svelte:head>

<ThemeRenderer
    template="index.njk"
    context={{
        posts: data.posts,
        user: data.user,
        context: 'home'
    }}
/>
