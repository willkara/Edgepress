<script lang="ts">
	import type { PageData } from './$types';
	import { getActiveTheme } from '$lib/themes/config';

	let { data }: { data: PageData } = $props();

	// Get active theme and components
	const theme = getActiveTheme();
	const TagArchive = theme.components.TagArchive;

	// Transform data to match theme props
	const transformedTag = {
		id: data.tag.id,
		name: data.tag.name,
		slug: data.tag.slug
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
		categories:
			post.category_name && post.category_slug
				? [{ id: '', name: post.category_name, slug: post.category_slug }]
				: []
	}));

	const pagination = {
		total: data.posts.length,
		limit: 100,
		offset: 0,
		hasMore: false
	};
</script>

<svelte:head>
	<title>#{transformedTag.name} - EdgePress</title>
	<meta name="description" content="Browse all posts tagged with {transformedTag.name}" />
</svelte:head>

<TagArchive
	tag={transformedTag}
	posts={transformedPosts}
	{pagination}
	themeConfig={theme.config}
	themeOptions={{}}
/>
