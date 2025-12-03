<script lang="ts">
	import type { PageData } from './$types';
	import { getActiveTheme } from '$lib/themes/config';

	let { data }: { data: PageData } = $props();

	// Get active theme and components
	const theme = getActiveTheme();
	const HomeIndex = theme.components.HomeIndex;

	// Transform data to match theme props
	const posts = data.latestPosts.map((post) => ({
		id: post.id,
		title: post.title,
		slug: post.slug,
		excerpt: post.excerpt,
		hero_image_url: post.hero_image_id
			? `/cdn-cgi/imagedelivery/${data.imageHash}/${post.hero_image_id}/public`
			: null,
		published_at: post.published_at,
		author_name: post.author_name || 'Unknown',
		read_time: post.reading_time || 0,
		categories:
			post.category_name && post.category_slug
				? [{ id: '', name: post.category_name, slug: post.category_slug }]
				: [],
		tags: []
	}));
</script>

<svelte:head>
	<title>EdgePress - Blog at the Edge</title>
	<meta name="description" content="A serverless blog platform powered by Cloudflare" />
</svelte:head>

<HomeIndex {posts} themeConfig={theme.config} themeOptions={{}} />
