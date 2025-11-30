<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.pageTitle} | EdgePress</title>
	<meta name="description" content={data.pageSubtitle} />
</svelte:head>

<div class="projects-page">
	<header class="page-header">
		<h1>{data.pageTitle}</h1>
		<p class="subtitle">{data.pageSubtitle}</p>
	</header>

	{#if data.projects.length === 0}
		<div class="empty-state">
			<p>No projects yet. Check back soon!</p>
		</div>
	{:else}
		<div class="projects-grid">
			{#each data.projects as project (project.id)}
				<ProjectCard
					{project}
					imageHash={data.imageHash}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.projects-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin-bottom: 1rem;
		background: linear-gradient(to right, #fff, #94a3b8);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.subtitle {
		font-size: 1.25rem;
		color: var(--text-muted);
		max-width: 600px;
		margin: 0 auto;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem;
		color: var(--text-muted);
		background: var(--bg-elevated);
		border-radius: 1rem;
		border: 1px dashed var(--border-subtle);
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2.5rem;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
