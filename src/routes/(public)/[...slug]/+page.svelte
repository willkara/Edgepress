<script lang="ts">
	import type { PageData } from './$types';
	import { getActiveTheme } from '$lib/themes/config';

	let { data }: { data: PageData } = $props();

	// Get active theme and components
	const theme = getActiveTheme();
	const PageSingle = theme.components.PageSingle;

	// Transform data to match theme props
	const transformedPage = data.page
		? {
				id: data.page.id,
				title: data.page.title,
				slug: data.page.slug,
				content_html: data.page.content_html,
				excerpt: data.page.excerpt,
				hero_image_url: data.page.hero_image_id
					? `/cdn-cgi/imagedelivery/${data.imageHash}/${data.page.hero_image_id}/public`
					: null,
				published_at: data.page.published_at,
				updated_at: data.page.updated_at,
				template: data.page.template
			}
		: null;
</script>

<svelte:head>
	<title>{transformedPage?.title || 'EdgePress'} - EdgePress</title>
	<meta
		name="description"
		content={transformedPage?.excerpt ||
			transformedPage?.title ||
			'A serverless blog platform powered by Cloudflare'}
	/>
</svelte:head>

{#if transformedPage}
	<PageSingle page={transformedPage} themeConfig={theme.config} themeOptions={{}} />
{:else}
	<div
		class="relative mx-auto flex max-w-screen-xl px-4 py-8 text-center text-lg text-muted-foreground"
	>
		<p>Page not found. Please check the URL.</p>
	</div>
{/if}
