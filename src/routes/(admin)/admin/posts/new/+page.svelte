<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { generateSlug } from '$lib/utils/slug';
	import type { Editor } from '@tiptap/core';
	import EdraEditor from '$lib/components/edra/shadcn/editor.svelte';
	import EdraToolbar from '$lib/components/edra/shadcn/toolbar.svelte';

	let { data }: { data: PageData } = $props();

	let title = $state('');
	let slug = $state('');
	let slugEdited = $state(false);
	let editor = $state<Editor>();
	let excerpt = $state('');
	let categoryId = $state('');
	let selectedTags = $state<string[]>([]);
	let heroImageId = $state('');
	let saving = $state(false);
	let error = $state('');
	let showPreview = $state(false);
	let previewHtml = $state('');

	// Auto-generate slug from title
	$effect(() => {
		if (!slugEdited && title) {
			slug = generateSlug(title);
		}
	});

	function handleSlugEdit() {
		slugEdited = true;
	}

	function togglePreview() {
		if (showPreview) {
			showPreview = false;
		} else {
			if (editor) {
				previewHtml = editor.getHTML();
			}
			showPreview = true;
		}
	}

	function getMarkdownSafe(ed: Editor): string | null {
		// Preferred: the helper added by the Markdown extension
		if (typeof ed.getMarkdown === 'function') {
			return ed.getMarkdown();
		}

		// Preferred: built-in getMarkdown if available
		const storage = ed.storage.markdown as any;
		if (storage && typeof storage.getMarkdown === 'function') {
			return storage.getMarkdown();
		}

		// Fallback: serialize via markdown manager if present
		const serializer = storage?.manager?.serializer || storage?.serializer;
		if (serializer && typeof serializer.serialize === 'function') {
			return serializer.serialize(ed.state.doc);
		}

		return null;
	}

	async function savePost(status: 'draft' | 'published') {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		if (!editor) {
			error = 'Editor not initialized';
			return;
		}

		const contentMd = getMarkdownSafe(editor);

		if (!contentMd) {
			error = 'Editor markdown plugin not ready. Please try again.';
			return;
		}

		if (!contentMd.trim()) {
			error = 'Content is required';
			return;
		}

		saving = true;
		error = '';

		try {
			// Get HTML content from editor
			const contentHtml = editor.getHTML();

			const response = await fetch('/api/admin/posts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					slug: slug.trim() || undefined,
					content_md: contentMd.trim(),
					content_html: contentHtml,
					excerpt: excerpt.trim() || null,
					category_id: categoryId || null,
					hero_image_id: heroImageId || null,
					status,
					published_at: status === 'published' ? new Date().toISOString() : null
				})
			});

			if (response.ok) {
				const post = await response.json();

				// Update tags
				if (selectedTags.length > 0) {
					await fetch(`/api/admin/posts/${post.id}/tags`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ tag_ids: selectedTags })
					});
				}

				// Redirect to posts list
				goto('/admin/posts');
			} else {
				const errorData = await response.json();
				error = errorData.message || errorData.error || 'Failed to create post';
			}
		} catch (err: any) {
			error = err.message || 'Failed to create post';
		} finally {
			saving = false;
		}
	}

	function handleTagToggle(tagId: string) {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((id) => id !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
	}
</script>

<svelte:head>
	<title>Create New Post - EdgePress Admin</title>
</svelte:head>

<div class="editor-page">
	<div class="page-header">
		<h1>Create New Post</h1>
		<div class="header-actions">
			<button onclick={togglePreview} class="btn-secondary">
				{showPreview ? 'Edit' : 'Preview'}
			</button>
			<a href="/admin/posts" class="btn-secondary">Cancel</a>
			<button onclick={() => savePost('draft')} disabled={saving} class="btn-secondary">
				{saving ? 'Saving...' : 'Save Draft'}
			</button>
			<button onclick={() => savePost('published')} disabled={saving} class="btn-primary">
				{saving ? 'Publishing...' : 'Publish'}
			</button>
		</div>
	</div>

	{#if error}
		<div class="error-message">
			{error}
		</div>
	{/if}

	<div class="editor-layout">
		<div class="main-content">
			<div class="form-group">
				<label for="title">Title *</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					placeholder="Enter post title..."
					required
				/>
			</div>

			<div class="form-group">
				<label for="slug">
					Slug
					<span class="hint">Leave blank to auto-generate from title</span>
				</label>
				<input
					id="slug"
					type="text"
					bind:value={slug}
					placeholder="post-slug"
					oninput={handleSlugEdit}
				/>
			</div>

			<div class="form-group">
				<label for="content">
					Content *
					<span class="hint">Rich text editor with markdown support</span>
				</label>

				<!-- Editor Container -->
				<div class="editor-container" class:hidden={showPreview}>
					{#if !editor}
						<div class="editor-loading">Loading editor...</div>
					{/if}
					<div class:hidden={!editor}>
						{#if editor}
							<EdraToolbar {editor} />
						{/if}
						<EdraEditor bind:editor autofocus={false} class="editor-content" />
					</div>
				</div>

				<!-- Preview Container -->
				{#if showPreview}
					<div class="preview-container article-body">
						<div class="prose max-w-none">
							{@html previewHtml}
						</div>
					</div>
				{/if}
			</div>

			<div class="form-group">
				<label for="excerpt">
					Excerpt
					<span class="hint">Optional short summary</span>
				</label>
				<textarea
					id="excerpt"
					bind:value={excerpt}
					placeholder="Brief summary of the post..."
					rows="3"
				></textarea>
			</div>
		</div>

		<div class="sidebar">
			<div class="sidebar-section">
				<h3>Category</h3>
				<select bind:value={categoryId}>
					<option value="">No Category</option>
					{#each data.categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<div class="sidebar-section">
				<h3>Tags</h3>
				{#if data.tags.length === 0}
					<p class="empty-text">No tags available</p>
				{:else}
					<div class="tags-list">
						{#each data.tags as tag}
							<label class="tag-checkbox">
								<input
									type="checkbox"
									checked={selectedTags.includes(tag.id)}
									onchange={() => handleTagToggle(tag.id)}
								/>
								<span>{tag.name}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<div class="sidebar-section">
				<h3>Hero Image</h3>
				<input type="text" bind:value={heroImageId} placeholder="Image ID" />
				<p class="hint">Enter Cloudflare Image ID</p>
			</div>
		</div>
	</div>
</div>

<style>
	.editor-page {
		padding: 1rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		letter-spacing: -0.02em;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.error-message {
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		color: #fca5a5;
		margin-bottom: 2rem;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 2rem;
	}

	.main-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.sidebar-section {
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.sidebar-section h3 {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-main);
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-main);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.hint {
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--text-muted);
	}

	input[type='text'],
	textarea,
	select {
		padding: 0.75rem 1rem;
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		background: var(--bg-page);
		color: var(--text-main);
		font-size: 0.9rem;
		font-family: inherit;
		transition: all 0.15s;
	}

	input[type='text']:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}

	textarea {
		resize: vertical;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.tags-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.tag-checkbox {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.15s;
	}

	.tag-checkbox:hover {
		background: var(--bg-soft);
	}

	.tag-checkbox input[type='checkbox'] {
		width: auto;
		cursor: pointer;
		accent-color: var(--accent);
	}

	.tag-checkbox span {
		font-size: 0.9rem;
		color: var(--text-main);
	}

	.empty-text {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.btn-primary {
		padding: 0.6rem 1.2rem;
		background: linear-gradient(to right, var(--accent-strong), var(--accent));
		color: #0f172a;
		border: none;
		border-radius: 999px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		transition: all 0.15s;
	}

	.btn-primary:hover:not(:disabled) {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		padding: 0.6rem 1.2rem;
		background: var(--bg-elevated);
		color: var(--text-main);
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		transition: all 0.15s;
	}

	.btn-secondary:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.editor-container {
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--bg-elevated);
	}

	.editor-container :global(.editor-content) {
		min-height: 500px;
		max-height: 800px;
		overflow-y: auto;
		background: var(--bg-page); /* Slightly darker than the toolbar/container */
		color: var(--text-main);
		padding: 1.5rem;
	}

	.editor-container :global(.ProseMirror) {
		outline: none;
	}

	.editor-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 200px;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.hidden {
		display: none;
	}

	.preview-container {
		min-height: 500px;
		padding: 2rem;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
	}

	@media (max-width: 1024px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}

		.sidebar {
			order: 2;
		}
	}

	@media (max-width: 768px) {
		.editor-page {
			padding: 1rem 0;
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.header-actions {
			width: 100%;
			flex-wrap: wrap;
		}

		.header-actions > * {
			flex: 1;
			min-width: 100px;
		}
	}
</style>
