<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let title = $state('');
	let slug = $state('');
	let excerpt = $state('');
	let content_md = $state('');
	let content_html = $state('');
	let status = $state<'draft' | 'published'>('draft');
	let template = $state('page.njk');
	let autoSlug = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);

	// Simple markdown to HTML converter (basic)
	function markdownToHtml(md: string): string {
		let html = md;

		// Headers
		html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
		html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
		html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

		// Bold
		html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

		// Italic
		html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

		// Links
		html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

		// Line breaks
		html = html.replace(/\n\n/g, '</p><p>');
		html = '<p>' + html + '</p>';

		return html;
	}

	// Generate slug from title
	function generateSlug(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	// Update slug when title changes (if auto-slug is enabled)
	$effect(() => {
		if (autoSlug && title) {
			slug = generateSlug(title);
		}
	});

	// Update HTML when markdown changes
	$effect(() => {
		content_html = markdownToHtml(content_md);
	});

	async function savePage() {
		// Validate
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		if (!slug.trim()) {
			error = 'Slug is required';
			return;
		}

		if (!content_md.trim()) {
			error = 'Content is required';
			return;
		}

		error = null;
		saving = true;

		try {
			const response = await fetch('/api/admin/pages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					slug,
					excerpt: excerpt || null,
					content_md,
					content_html,
					status,
					template
				})
			});

			if (response.ok) {
				const result = await response.json();
				// Redirect to edit page
				goto(`/admin/pages/${result.id}/edit`);
			} else {
				const err = await response.json();
				error = err.message || 'Failed to save page';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>New Page - EdgePress Admin</title>
</svelte:head>

<div class="page-editor">
	<div class="editor-header">
		<h1>Create New Page</h1>
		<div class="actions">
			<a href="/admin/pages" class="btn-secondary">Cancel</a>
			<button onclick={savePage} class="btn-primary" disabled={saving}>
				{saving ? 'Saving...' : 'Save Page'}
			</button>
		</div>
	</div>

	{#if error}
		<div class="alert alert-error">
			{error}
		</div>
	{/if}

	<div class="editor-body">
		<div class="form-group">
			<label for="title">Title</label>
			<input
				id="title"
				type="text"
				bind:value={title}
				placeholder="About Us"
				class="form-control"
			/>
		</div>

		<div class="form-group">
			<label for="slug">
				Slug
				<span class="help-text">The URL path for this page (e.g., "about" for /about)</span>
			</label>
			<div class="slug-input">
				<span class="slug-prefix">/</span>
				<input
					id="slug"
					type="text"
					bind:value={slug}
					placeholder="about"
					class="form-control"
					onfocus={() => (autoSlug = false)}
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="excerpt">Excerpt (Optional)</label>
			<textarea
				id="excerpt"
				bind:value={excerpt}
				placeholder="A brief description of this page..."
				rows="2"
				class="form-control"
			></textarea>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="status">Status</label>
				<select id="status" bind:value={status} class="form-control">
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>

			<div class="form-group">
				<label for="template">
					Template
					<span class="help-text">Ghost-style template (e.g., page-about.njk)</span>
				</label>
				<input
					id="template"
					type="text"
					bind:value={template}
					placeholder="page.njk"
					class="form-control"
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="content">Content (Markdown)</label>
			<textarea
				id="content"
				bind:value={content_md}
				placeholder="# Welcome to our page

Write your content here using Markdown...

## Features
- Simple and clean
- Ghost-style theming ready
- Fast edge rendering"
				rows="20"
				class="form-control code-editor"
			></textarea>
		</div>

		<div class="preview-section">
			<h3>Preview</h3>
			<div class="preview-content">
				{@html content_html}
			</div>
		</div>
	</div>
</div>

<style>
	.page-editor {
		padding: 2rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.editor-header h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.editor-body {
		background: var(--surface);
		border-radius: 8px;
		padding: 2rem;
		border: 1px solid var(--border);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--text);
	}

	.help-text {
		font-weight: 400;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-left: 0.5rem;
	}

	.form-control {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		font-family: inherit;
		font-size: 1rem;
		transition: border-color 150ms;
	}

	.form-control:focus {
		outline: none;
		border-color: var(--accent);
	}

	.slug-input {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.slug-prefix {
		color: var(--text-muted);
		font-weight: 500;
	}

	textarea.form-control {
		resize: vertical;
		font-family: inherit;
	}

	.code-editor {
		font-family: 'Courier New', Consolas, monospace;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.preview-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid var(--border);
	}

	.preview-section h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.preview-content {
		padding: 1.5rem;
		background: var(--bg);
		border-radius: 6px;
		border: 1px solid var(--border);
		min-height: 200px;
	}

	.preview-content :global(h1) {
		font-size: 2rem;
		margin: 1rem 0;
	}

	.preview-content :global(h2) {
		font-size: 1.5rem;
		margin: 1rem 0;
	}

	.preview-content :global(h3) {
		font-size: 1.25rem;
		margin: 1rem 0;
	}

	.preview-content :global(p) {
		margin: 1rem 0;
		line-height: 1.6;
	}

	.preview-content :global(a) {
		color: var(--accent);
		text-decoration: underline;
	}

	.alert {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
	}

	.alert-error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
	}

	.btn-primary, .btn-secondary {
		padding: 0.625rem 1.25rem;
		border-radius: 6px;
		font-weight: 500;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: all 150ms;
	}

	.btn-primary {
		background: var(--accent);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--surface-hover);
	}
</style>
