<script lang="ts">
	import type { PageData } from './$types';
	import { getActiveTheme } from '$lib/themes/config';

	let { data }: { data: PageData } = $props();

	// Get active theme and components
	const theme = getActiveTheme();
	const PostList = theme.components.PostList;

	// Transform data to match theme props
	const posts = data.posts.map((post) => ({
		id: post.id,
		title: post.title,
		slug: post.slug,
		excerpt: post.excerpt,
		hero_image_url: post.hero_image_id ? `/cdn-cgi/imagedelivery/YOUR_HASH/${post.hero_image_id}/public` : null,
		published_at: post.published_at,
		author_name: post.author_name || 'Unknown',
		read_time: post.reading_time || 0,
		categories: post.category_name && post.category_slug
			? [{ id: '', name: post.category_name, slug: post.category_slug }]
			: [],
		tags: []
	}));

	const pagination = {
		total: data.posts.length,
		limit: 20,
		offset: 0,
		hasMore: false
	};
</script>

<svelte:head>
	<title>Blog - EdgePress</title>
	<meta name="description" content="All blog posts from EdgePress" />
</svelte:head>

<PostList {posts} {pagination} themeConfig={theme.config} themeOptions={{}} />
