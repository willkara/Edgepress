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
    template="pages/home.njk"
    context={{
        posts: data.posts,
        user: data.user
    }}
/>
