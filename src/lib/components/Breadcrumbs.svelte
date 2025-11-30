<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	let { items }: { items: BreadcrumbItem[] } = $props();

	// Generate Schema.org structured data for SEO
	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			...(item.href && { item: item.href })
		}))
	};
</script>

<svelte:head>
	<script type="application/ld+json">
		{JSON.stringify(schemaData)}
	</script>
</svelte:head>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	<ol class="breadcrumb-list">
		{#each items as item, index}
			<li class="breadcrumb-item">
				{#if item.href}
					<a href={item.href} class="breadcrumb-link">
						{item.label}
					</a>
				{:else}
					<span class="breadcrumb-current" aria-current="page">
						{item.label}
					</span>
				{/if}
                                {#if index < items.length - 1}
                                        <span class="breadcrumb-separator" aria-hidden="true">
                                                <ChevronRight />
                                        </span>
                                {/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumbs {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.breadcrumb-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.breadcrumb-link {
		color: var(--text-subtle);
		text-decoration: none;
		transition: color 150ms;
	}

	.breadcrumb-link:hover {
		color: var(--accent);
	}

	.breadcrumb-link:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 0.25rem;
	}

	.breadcrumb-current {
		color: var(--text-main);
		font-weight: 500;
	}

        .breadcrumb-separator {
                display: inline-flex;
                width: 1rem;
                height: 1rem;
                color: var(--text-subtle);
                flex-shrink: 0;
        }

        .breadcrumb-separator :global(svg) {
                width: 100%;
                height: 100%;
        }

	@media (max-width: 640px) {
		.breadcrumb-item {
			font-size: 0.8125rem;
		}

                .breadcrumb-separator {
                        width: 0.875rem;
                        height: 0.875rem;
                }
	}
</style>
