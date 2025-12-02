<script lang="ts">
	import { formatDateStandard } from '$lib/utils/date';
	import type { PageData } from './$types';
	import { ArrowLeft, GitFork, Globe } from 'lucide-svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import CloudflareImage from '$lib/components/CloudflareImage.svelte';
	import CopyCodeButton from '$lib/components/CopyCodeButton.svelte';
	import { marked } from 'marked'; // Direct import marked
	import DOMPurify from 'isomorphic-dompurify';

	let { data }: { data: PageData } = $props();
	const project = data.project;

	// Build breadcrumbs
	const breadcrumbItems = project
		? [
				{ label: 'Home', href: '/' },
				{ label: 'Projects', href: '/projects' },
				{ label: project.title }
			]
		: [];

	let sanitizedContent = $state('');

	$effect(() => {
		if (project?.content_md) {
			const html = marked.parse(project.content_md);
			sanitizedContent = DOMPurify.sanitize(html); // Re-added DOMPurify
		} else {
			sanitizedContent = '';
		}
	});
</script>

<svelte:head>
	<title>{project?.title || 'Project'} - EdgePress</title>
	<meta name="description" content={project?.description || 'A project on EdgePress'} />
</svelte:head>

{#if project}
	<div class="relative mx-auto flex max-w-screen-xl px-4 py-8">
		<div class="flex-1 min-w-0 max-w-prose mx-auto">
			<div class="mb-8">
				<a href="/projects" class="article-back">
					<ArrowLeft class="h-4 w-4" />
					Back to projects
				</a>

				<Breadcrumbs items={breadcrumbItems} />

				<div class="article-meta flex flex-wrap items-center gap-x-2 gap-y-1">
					<span>Published {formatDateStandard(project.created_at)}</span>
					{#if project.updated_at && project.updated_at !== project.created_at}
						<span>· Updated {formatDateStandard(project.updated_at)}</span>
					{/if}
				</div>
				<h1 class="article-title">{project.title}</h1>

				{#if project.description}
					<p class="text-lg text-muted-foreground mb-6">{project.description}</p>
				{/if}

				{#if project.tech_stack && project.tech_stack.length > 0}
					<div class="article-tags">
						{#each project.tech_stack as tech}
							<span class="tag">{tech}</span>
						{/each}
					</div>
				{/if}

				<div class="flex flex-wrap gap-4 mt-8">
					{#if project.repo_url}
						<a
							href={project.repo_url}
							target="_blank"
							rel="noopener noreferrer"
							class="button-primary"
						>
							<GitFork class="w-4 h-4" />
							View Repo
						</a>
					{/if}
					{#if project.demo_url}
						<a
							href={project.demo_url}
							target="_blank"
							rel="noopener noreferrer"
							class="button-ghost"
						>
							<Globe class="w-4 h-4" />
							Live Demo
						</a>
					{/if}
				</div>
			</div>

			{#if project.hero_image_id}
				<div class="mb-8">
					<CloudflareImage
						imageId={project.hero_image_id}
						alt={`Hero image for ${project.title}`}
						variant="public"
						class="w-full h-auto rounded-lg"
					/>
				</div>
			{/if}

			{#if sanitizedContent}
				<div class="article-body">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html sanitizedContent}
					<CopyCodeButton />
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div
		class="relative mx-auto flex max-w-screen-xl px-4 py-8 text-center text-lg text-muted-foreground"
	>
		<p>Project not found. Please check the URL.</p>
	</div>
{/if}

<style>
	.article-back {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-subtle);
		text-decoration: none;
		margin-bottom: 2rem;
		transition: color 150ms;
	}

	.article-back:hover {
		color: var(--accent);
	}

	.article-meta {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 0.4rem;
	}

	.article-title {
		font-size: 1.7rem;
		margin: 0 0 0.4rem;
		color: var(--text-main);
		line-height: 1.3;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.text-muted-foreground {
		color: var(--text-muted);
	}

	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: var(--tag-bg);
		border: 1px solid rgba(148, 163, 184, 0.4);
		color: var(--text-muted);
		text-decoration: none;
		transition: all 150ms;
	}

	.tag:hover {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}

	.button-primary,
	.button-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 999px;
		font-size: 0.95rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 150ms;
		cursor: pointer;
	}

	.button-primary {
		background: linear-gradient(to right, var(--accent-strong), var(--accent));
		color: #0f172a;
		box-shadow: 0 10px 28px rgba(var(--accent-rgb), 0.22);
	}

	.button-primary:hover {
		filter: brightness(1.05);
		box-shadow: 0 12px 34px rgba(var(--accent-rgb), 0.3);
		transform: translateY(-1px);
	}

	.button-ghost {
		border: 1px solid var(--border-subtle);
		color: var(--text-muted);
		background: rgba(15, 23, 42, 0.7);
	}

	.button-ghost:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: rgba(15, 23, 42, 0.9);
	}

	.article-body {
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		padding: 1.75rem 1.6rem;
		box-shadow: var(--shadow-soft);
		font-size: 0.98rem;
		line-height: 1.7;
		color: var(--text-main);
		position: relative;
		overflow: hidden;
	}
</style>
