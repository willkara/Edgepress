<script lang="ts">
	import type { PageData } from './$types';
	import { getActiveTheme } from '$lib/themes/config';

	let { data }: { data: PageData } = $props();

	// Get active theme and components
	const theme = getActiveTheme();
	const PostSingle = theme.components.PostSingle;

	// Transform data to match theme props
	const transformedPost = data.post
		? {
				id: data.post.id,
				title: data.post.title,
				slug: data.post.slug,
				content_html: data.post.content_html,
				excerpt: data.post.excerpt,
				hero_image_url: data.post.hero_image_id
					? `/cdn-cgi/imagedelivery/${data.imageHash}/${data.post.hero_image_id}/public`
					: null,
				published_at: data.post.published_at,
				updated_at: data.post.updated_at,
				author_name: data.post.author_name || 'Unknown',
				read_time: data.post.reading_time || 0,
				categories:
					data.post.category_name && data.post.category_slug
						? [{ id: '', name: data.post.category_name, slug: data.post.category_slug }]
						: [],
				tags: data.tags.map((tag) => ({
					id: tag.id,
					name: tag.name,
					slug: tag.slug
				}))
			}
		: null;

	const transformedRelatedPosts = data.relatedPosts?.map((post) => ({
		id: post.id,
		title: post.title,
		slug: post.slug,
		excerpt: post.excerpt,
		hero_image_url: post.hero_image_id
			? `/cdn-cgi/imagedelivery/${data.imageHash}/${post.hero_image_id}/public`
			: null,
		published_at: post.published_at
	}));
</script>

<svelte:head>
	<title>{transformedPost?.title || 'EdgePress'} - EdgePress</title>
	<meta
		name="description"
		content={transformedPost?.excerpt ||
			transformedPost?.title ||
			'A serverless blog platform powered by Cloudflare'}
	/>
</svelte:head>

{#if transformedPost}
	<PostSingle
		post={transformedPost}
		relatedPosts={transformedRelatedPosts}
		themeConfig={theme.config}
		themeOptions={{}}
	/>
{:else}
	<div
		class="relative mx-auto flex max-w-screen-xl px-4 py-8 text-center text-lg text-muted-foreground"
	>
		<p>Post not found. Please check the URL.</p>
	</div>
{/if}
