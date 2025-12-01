<script lang="ts">
	import type { PageData } from './$types';
	import { GripVertical, Plus, X, Eye, EyeOff, Save } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let featuredProjects = $state(data.featuredProjects);
	let unfeaturedPosts = $state(data.unfeaturedPosts);
	let settings = $state(data.settings);
	let error = $state('');
	let success = $state('');
	let saving = $state(false);

	// Settings editing
	let editingSettings = $state(false);
	let settingsForm = $state({
		pageTitle: '',
		pageSubtitle: '',
		showAll: false
	});

	$effect(() => {
		settingsForm = {
			pageTitle: settings.pageTitle,
			pageSubtitle: settings.pageSubtitle,
			showAll: settings.showAll
		};
	});

	// Drag and drop state
	let draggedItem = $state<any>(null);

	function handleDragStart(event: DragEvent, project: any) {
		draggedItem = project;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	async function handleDrop(event: DragEvent, targetProject: any) {
		event.preventDefault();
		if (!draggedItem || draggedItem.id === targetProject.id) return;

		const oldIndex = featuredProjects.findIndex((p) => p.id === draggedItem.id);
		const newIndex = featuredProjects.findIndex((p) => p.id === targetProject.id);

		// Reorder locally
		const items = [...featuredProjects];
		const [removed] = items.splice(oldIndex, 1);
		items.splice(newIndex, 0, removed);

		// Update display_order for all items
		const updated = items.map((item, index) => ({
			...item,
			display_order: index
		}));

		featuredProjects = updated;

		// Save to server
		try {
			const response = await fetch('/api/admin/projects/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orders: updated.map((p) => ({ id: p.id, display_order: p.display_order }))
				})
			});

			if (!response.ok) {
				throw new Error('Failed to reorder projects');
			}

			success = 'Projects reordered successfully';
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to reorder projects';
			// Reload page to reset order
			window.location.reload();
		}

		draggedItem = null;
	}

	async function addToFeatured(postId: string) {
		try {
			const response = await fetch('/api/admin/projects/featured', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					post_id: postId,
					display_order: featuredProjects.length
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to add project');
			}

			const newFeatured = await response.json();
			featuredProjects = [...featuredProjects, newFeatured];
			unfeaturedPosts = unfeaturedPosts.filter((p) => p.id !== postId);

			success = 'Project added to featured list';
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to add project';
		}
	}

	async function removeFromFeatured(id: string, postId: string) {
		if (!confirm('Remove this project from the featured list?')) return;

		try {
			const response = await fetch(`/api/admin/projects/featured/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to remove project');
			}

			const removed = featuredProjects.find((p) => p.id === id);
			featuredProjects = featuredProjects.filter((p) => p.id !== id);

			// Add back to unfeatured if it was a published project post
			if (removed) {
				unfeaturedPosts = [
					...unfeaturedPosts,
					{
						id: postId,
						title: removed.post_title,
						slug: removed.post_slug,
						excerpt: removed.post_excerpt,
						published_at: removed.post_published_at
					}
				];
			}

			success = 'Project removed from featured list';
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to remove project';
		}
	}

	async function toggleFeatured(id: string) {
		try {
			const response = await fetch(`/api/admin/projects/featured/${id}/toggle`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to toggle visibility');
			}

			featuredProjects = featuredProjects.map((p) =>
				p.id === id ? { ...p, is_featured: p.is_featured === 1 ? 0 : 1 } : p
			);

			success = 'Visibility toggled';
			setTimeout(() => (success = ''), 2000);
		} catch (err: any) {
			error = err.message || 'Failed to toggle visibility';
		}
	}

	async function saveSettings() {
		saving = true;
		error = '';

		try {
			const response = await fetch('/api/admin/projects/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(settingsForm)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save settings');
			}

			settings = { ...settingsForm };
			editingSettings = false;
			success = 'Settings saved successfully';
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to save settings';
		} finally {
			saving = false;
		}
	}

	function cancelSettingsEdit() {
		settingsForm = {
			pageTitle: settings.pageTitle,
			pageSubtitle: settings.pageSubtitle,
			showAll: settings.showAll
		};
		editingSettings = false;
	}
</script>

<svelte:head>
	<title>Manage Projects Page - EdgePress Admin</title>
</svelte:head>

<div class="projects-admin-page">
	<div class="page-header">
		<h1>Projects Page</h1>
		<p class="subtitle">Manage featured projects and page settings</p>
	</div>

	{#if error}
		<div class="message error-message">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="message success-message">
			{success}
		</div>
	{/if}

	<!-- Page Settings -->
	<div class="settings-card">
		<div class="settings-header">
			<h2>Page Settings</h2>
			{#if !editingSettings}
				<button onclick={() => (editingSettings = true)} class="btn-small btn-secondary">
					Edit Settings
				</button>
			{/if}
		</div>

		{#if editingSettings}
			<div class="settings-form">
				<div class="form-group">
					<label for="page-title">Page Title</label>
					<input
						id="page-title"
						type="text"
						bind:value={settingsForm.pageTitle}
						placeholder="My Projects"
						disabled={saving}
					/>
				</div>

				<div class="form-group">
					<label for="page-subtitle">Page Subtitle</label>
					<textarea
						id="page-subtitle"
						bind:value={settingsForm.pageSubtitle}
						placeholder="Explore the things I've built..."
						rows="2"
						disabled={saving}
					></textarea>
				</div>

				<div class="form-group-checkbox">
					<input
						id="show-all"
						type="checkbox"
						bind:checked={settingsForm.showAll}
						disabled={saving}
					/>
					<label for="show-all">
						Show all posts with "Projects" category (even if not featured)
					</label>
				</div>

				<div class="form-actions">
					<button onclick={saveSettings} disabled={saving} class="btn-primary">
						<Save class="w-4 h-4" />
						{saving ? 'Saving...' : 'Save Settings'}
					</button>
					<button onclick={cancelSettingsEdit} disabled={saving} class="btn-secondary">
						Cancel
					</button>
				</div>
			</div>
		{:else}
			<div class="settings-display">
				<div class="setting-item">
					<span class="setting-label">Title:</span>
					<span class="setting-value">{settings.pageTitle}</span>
				</div>
				<div class="setting-item">
					<span class="setting-label">Subtitle:</span>
					<span class="setting-value">{settings.pageSubtitle}</span>
				</div>
				<div class="setting-item">
					<span class="setting-label">Show all projects:</span>
					<span class="setting-value">{settings.showAll ? 'Yes' : 'No'}</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Featured Projects -->
	<div class="section">
		<h2>Featured Projects ({featuredProjects.length})</h2>
		<p class="section-subtitle">
			Drag and drop to reorder. Toggle visibility to show/hide on the public page.
		</p>

		{#if featuredProjects.length === 0}
			<div class="empty-state">
				<p>No featured projects yet. Add projects from the list below.</p>
			</div>
		{:else}
			<div class="featured-list">
				{#each featuredProjects as project (project.id)}
					<div
						class="featured-item"
						class:hidden={project.is_featured === 0}
						draggable="true"
						role="listitem"
						aria-grabbed={draggedItem?.id === project.id ? 'true' : 'false'}
						ondragstart={(e) => handleDragStart(e, project)}
						ondragover={handleDragOver}
						ondrop={(e) => handleDrop(e, project)}
					>
						<div class="drag-handle">
							<GripVertical class="w-5 h-5 text-gray-400" />
						</div>

						<div class="project-info">
							<div class="project-header">
								<h3>{project.post_title}</h3>
								{#if project.is_featured === 0}
									<span class="badge badge-muted">Hidden</span>
								{/if}
							</div>
							{#if project.custom_description || project.post_excerpt}
								<p class="project-excerpt">
									{project.custom_description || project.post_excerpt}
								</p>
							{/if}
							<div class="project-meta">
								<span class="meta-item">Slug: <code>{project.post_slug}</code></span>
								{#if project.category_name}
									<span class="meta-item">Category: {project.category_name}</span>
								{/if}
								{#if project.tags.length > 0}
									<span class="meta-item">Tags: {project.tags.join(', ')}</span>
								{/if}
							</div>
						</div>

						<div class="project-actions">
							<button
								onclick={() => toggleFeatured(project.id)}
								class="btn-icon"
								title={project.is_featured === 1 ? 'Hide from page' : 'Show on page'}
							>
								{#if project.is_featured === 1}
									<Eye class="w-4 h-4" />
								{:else}
									<EyeOff class="w-4 h-4" />
								{/if}
							</button>
							<button
								onclick={() => removeFromFeatured(project.id, project.post_id)}
								class="btn-icon btn-danger-icon"
								title="Remove from featured"
							>
								<X class="w-4 h-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Available Project Posts -->
	<div class="section">
		<h2>Available Project Posts ({unfeaturedPosts.length})</h2>
		<p class="section-subtitle">
			Posts with "Projects" category that are not yet featured. Click + to add to featured list.
		</p>

		{#if unfeaturedPosts.length === 0}
			<div class="empty-state">
				<p>
					All project posts are featured. Create new posts with the "Projects" category to add more.
				</p>
			</div>
		{:else}
			<div class="available-list">
				{#each unfeaturedPosts as post}
					<div class="available-item">
						<div class="post-info">
							<h3>{post.title}</h3>
							{#if post.excerpt}
								<p class="post-excerpt">{post.excerpt}</p>
							{/if}
							<span class="post-meta">Slug: <code>{post.slug}</code></span>
						</div>
						<button
							onclick={() => addToFeatured(post.id)}
							class="btn-icon btn-primary-icon"
							title="Add to featured"
						>
							<Plus class="w-4 h-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.projects-admin-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.message {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 2rem;
		font-size: 0.875rem;
	}

	.error-message {
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive));
		color: hsl(var(--destructive));
	}

	.success-message {
		background: hsl(142 76% 36% / 0.1);
		border: 1px solid hsl(142 76% 36%);
		color: hsl(142 76% 36%);
	}

	.settings-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.settings-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.settings-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.settings-display {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.setting-item {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.setting-label {
		font-weight: 500;
		color: hsl(var(--muted-foreground));
	}

	.setting-value {
		color: hsl(var(--foreground));
	}

	.section {
		margin-bottom: 2rem;
	}

	.section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin-bottom: 0.5rem;
	}

	.section-subtitle {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	input[type='text'],
	textarea {
		padding: 0.75rem 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	input[type='text']:focus,
	textarea:focus {
		outline: none;
		border-color: hsl(var(--primary));
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
	}

	input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.featured-list,
	.available-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.featured-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		padding: 1rem;
		cursor: move;
		transition: all 0.15s;
	}

	.featured-item.hidden {
		opacity: 0.6;
		background: hsl(var(--muted) / 0.3);
	}

	.featured-item:hover {
		border-color: hsl(var(--primary));
		box-shadow: 0 2px 8px hsl(var(--primary) / 0.1);
	}

	.drag-handle {
		cursor: grab;
		color: hsl(var(--muted-foreground));
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.project-info {
		flex: 1;
		min-width: 0;
	}

	.project-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.project-info h3 {
		font-size: 1rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.project-excerpt {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 0.5rem;
	}

	.project-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	.meta-item code {
		padding: 0.125rem 0.25rem;
		background: hsl(var(--muted));
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
	}

	.available-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.post-info {
		flex: 1;
		min-width: 0;
	}

	.post-info h3 {
		font-size: 0.95rem;
		font-weight: 500;
		color: hsl(var(--foreground));
		margin-bottom: 0.25rem;
	}

	.post-excerpt {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 0.25rem;
	}

	.post-meta {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	.post-meta code {
		padding: 0.125rem 0.25rem;
		background: hsl(var(--muted));
		border-radius: 0.25rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.badge-muted {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.empty-state {
		padding: 3rem 2rem;
		text-align: center;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.5rem;
		border: 1px dashed hsl(var(--border));
	}

	.empty-state p {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.btn-small {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		cursor: pointer;
		border: none;
		transition: all 0.15s;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		border: 1px solid hsl(var(--border));
	}

	.btn-secondary:hover:not(:disabled) {
		background: hsl(var(--muted));
	}

	.btn-icon {
		padding: 0.5rem;
		background: transparent;
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		cursor: pointer;
		color: hsl(var(--foreground));
		transition: all 0.15s;
	}

	.btn-icon:hover {
		background: hsl(var(--muted));
	}

	.btn-primary-icon {
		border-color: hsl(var(--primary));
		color: hsl(var(--primary));
	}

	.btn-primary-icon:hover {
		background: hsl(var(--primary) / 0.1);
	}

	.btn-danger-icon {
		border-color: hsl(var(--destructive));
		color: hsl(var(--destructive));
	}

	.btn-danger-icon:hover {
		background: hsl(var(--destructive) / 0.1);
	}

	@media (max-width: 768px) {
		.projects-admin-page {
			padding: 1rem;
		}

		.featured-item {
			flex-wrap: wrap;
		}

		.project-actions {
			width: 100%;
			justify-content: flex-end;
		}
	}
</style>
