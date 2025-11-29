<script lang="ts">
	import type { PageData } from './$types';
    import ThemeRenderer from '$lib/components/ThemeRenderer.svelte';
    import { formatDateStandard } from '$lib/utils/date';
    import DOMPurify from 'isomorphic-dompurify';
    import { extractToc } from '$lib/utils/toc';
    import type { TocItem } from '$lib/utils/toc';

	let { data }: { data: PageData } = $props();

    // Prepare data for the theme using derived state for reactivity
    let processedPost = $derived.by(() => {
        if (data.post) {
            const result = extractToc(data.post.content_html);
            return {
                toc: result.toc,
                sanitizedContent: DOMPurify.sanitize(result.html)
            };
        }
        return { toc: [], sanitizedContent: '' };
    });
</script>

<svelte:head>
	<title>{data.post?.title || 'EdgePress'} - EdgePress</title>
	<meta name="description" content={data.post?.excerpt || data.post?.title || 'A serverless blog platform powered by Cloudflare'} />
	<meta property="og:title" content={data.post?.title || 'EdgePress'} />
	<meta property="og:description" content={data.post?.excerpt || data.post?.title || 'A serverless blog platform powered by Cloudflare'} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={`https://yourdomain.com/blog/${data.post?.slug || ''}`} />
	{#if data.post?.hero_image_id}
		<meta property="og:image" content={`https://imagedelivery.net/YOUR_CF_ACCOUNT_HASH/${data.post.hero_image_id}/public`} />
	{/if}
</svelte:head>

<ThemeRenderer
    template="pages/post.njk"
    context={{
        post: data.post,
        user: data.user,
        toc: processedPost.toc,
        sanitizedContent: processedPost.sanitizedContent
    }}
/>
