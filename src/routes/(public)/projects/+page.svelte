<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	let { data }: { data: PageData } = $props();

	const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Projects' }];
</script>

<svelte:head>
	<title>{data.settings.pageTitle} - EdgePress</title>
	<meta name="description" content={data.settings.pageSubtitle} />
</svelte:head>

<div class="projects-page">
	<Breadcrumbs items={breadcrumbItems} />

	<section class="hero">
		<h1 class="hero-title">{data.settings.pageTitle}</h1>
		<p class="hero-subtitle">{data.settings.pageSubtitle}</p>
	</section>

	{#if data.projects.length === 0}
		<div class="empty-state">
			<p>No projects yet. Check back soon!</p>
		</div>
	{:else}
		<div class="projects-grid">
			{#each data.projects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.projects-page {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: var(--text-muted);
		max-width: 42rem;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
	}

	.empty-state p {
		font-size: 1rem;
		color: var(--text-muted);
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
