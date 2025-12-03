<script lang="ts">
	import type { PageData } from './$types';
	import { getActiveTheme } from '$lib/themes/config';

	let { data }: { data: PageData } = $props();

	// Get active theme and components
	const theme = getActiveTheme();
	const CategoryArchive = theme.components.CategoryArchive;

	// Transform data to match theme props
	const transformedCategory = {
		id: data.category.id,
		name: data.category.name,
		slug: data.category.slug,
		description: data.category.description
	};

	const transformedPosts = data.posts.map((post) => ({
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
		tags: []
	}));

	const pagination = {
		total: data.posts.length,
		limit: 100,
		offset: 0,
		hasMore: false
	};
</script>

<svelte:head>
	<title>{transformedCategory.name} - EdgePress</title>
	<meta name="description" content="Browse all posts in the {transformedCategory.name} category" />
</svelte:head>

<CategoryArchive
	category={transformedCategory}
	posts={transformedPosts}
	{pagination}
	themeConfig={theme.config}
	themeOptions={{}}
/>
