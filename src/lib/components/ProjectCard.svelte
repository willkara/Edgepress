<script lang="ts">
	import type { Project } from '$lib/server/db/projects';

	let { project, imageHash } = $props<{ project: Project; imageHash: string }>();
</script>

<a href="/projects/{project.slug}" class="project-card group">
	{#if project.hero_image_id}
		<div class="project-image-container">
			<img
				src="/cdn-cgi/imagedelivery/{imageHash}/{project.hero_image_id}/public"
				alt={project.title}
				class="project-image"
				loading="lazy"
			/>
		</div>
	{/if}

	<div class="project-content">
		<div class="project-header">
			<h3 class="project-title">{project.title}</h3>
		</div>

		<p class="project-description">{project.description}</p>

		{#if project.tech_stack && project.tech_stack.length > 0}
			<div class="project-tech">
				{#each project.tech_stack as tech}
					<span class="tech-badge">{tech}</span>
				{/each}
			</div>
		{/if}
	</div>
</a>

<style>
	.project-card {
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 1rem;
		overflow: hidden;
		transition:
			transform 0.2s,
			border-color 0.2s;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.project-card:hover {
		transform: translateY(-2px);
		border-color: var(--accent);
	}

	.project-image-container {
		aspect-ratio: 16/9;
		overflow: hidden;
		background: var(--bg-soft);
	}

	.project-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.project-card:hover .project-image {
		transform: scale(1.05);
	}

	.project-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		gap: 1rem;
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.project-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-main);
		line-height: 1.3;
	}

	.project-description {
		font-size: 0.95rem;
		color: var(--text-muted);
		line-height: 1.6;
		flex-grow: 1;
	}

	.project-tech {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: auto;
	}

	.tech-badge {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--accent);
		background: var(--accent-soft);
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
	}
</style>
