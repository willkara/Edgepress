<script lang="ts">
	import type { PageData } from './$types';
	import { generateSlug } from '$lib/utils/slug';

	let { data }: { data: PageData } = $props();

	let categories = $state(data.categories);
	let newName = $state('');
	let newSlug = $state('');
	let slugEdited = $state(false);
	let adding = $state(false);
	let error = $state('');

	// Edit state for each category
	let editingId = $state<string | null>(null);
	let editName = $state('');
	let editSlug = $state('');
	let editSlugEdited = $state(false);
	let saving = $state(false);

	// Delete confirmation
	let deletingId = $state<string | null>(null);
	let deleting = $state(false);

	// Auto-generate slug from name for new category
	$effect(() => {
		if (!slugEdited && newName) {
			newSlug = generateSlug(newName);
		}
	});

	// Auto-generate slug from name for edit mode
	$effect(() => {
		if (!editSlugEdited && editName && editingId) {
			editSlug = generateSlug(editName);
		}
	});

	function handleSlugEdit() {
		slugEdited = true;
	}

	function handleEditSlugChange() {
		editSlugEdited = true;
	}

	async function addCategory() {
		if (!newName.trim()) {
			error = 'Category name is required';
			return;
		}

		adding = true;
		error = '';

		try {
			const response = await fetch('/api/admin/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newName.trim(),
					slug: newSlug.trim() || undefined
				})
			});

			if (response.ok) {
				const category = await response.json();
				categories = [...categories, category];
				newName = '';
				newSlug = '';
				slugEdited = false;
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Failed to create category';
			}
		} catch (err: any) {
			error = err.message || 'Failed to create category';
		} finally {
			adding = false;
		}
	}

	function startEdit(category: any) {
		editingId = category.id;
		editName = category.name;
		editSlug = category.slug;
		editSlugEdited = false;
		error = '';
	}

	function cancelEdit() {
		editingId = null;
		editName = '';
		editSlug = '';
		editSlugEdited = false;
		error = '';
	}

	async function saveEdit() {
		if (!editName.trim()) {
			error = 'Category name is required';
			return;
		}

		saving = true;
		error = '';

		try {
			const response = await fetch(`/api/admin/categories/${editingId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: editName.trim(),
					slug: editSlug.trim()
				})
			});

			if (response.ok) {
				const updated = await response.json();
				categories = categories.map((c) => (c.id === editingId ? updated : c));
				cancelEdit();
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Failed to update category';
			}
		} catch (err: any) {
			error = err.message || 'Failed to update category';
		} finally {
			saving = false;
		}
	}

	function confirmDelete(categoryId: string) {
		deletingId = categoryId;
		error = '';
	}

	function cancelDelete() {
		deletingId = null;
	}

	async function deleteCategory(categoryId: string) {
		deleting = true;
		error = '';

		try {
			const response = await fetch(`/api/admin/categories/${categoryId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				const result = await response.json();
				categories = categories.filter((c) => c.id !== categoryId);
				deletingId = null;

				// Show success message if posts were affected
				if (result.affected_posts > 0) {
					error = result.message;
					setTimeout(() => (error = ''), 5000);
				}
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Failed to delete category';
			}
		} catch (err: any) {
			error = err.message || 'Failed to delete category';
		} finally {
			deleting = false;
		}
	}

	function getCategoryPostCount(category: any): number {
		return category.post_count || 0;
	}
</script>

<svelte:head>
	<title>Categories - EdgePress Admin</title>
</svelte:head>

<div class="categories-page">
	<div class="page-header">
		<h1>Categories</h1>
		<p class="subtitle">Organize your blog posts into categories</p>
	</div>

	{#if error}
		<div class="message" class:error-message={error.includes('Failed')}>
			{error}
		</div>
	{/if}

	<!-- Add New Category Form -->
	<div class="add-form">
		<h2>Add New Category</h2>
		<div class="form-row">
			<div class="form-group">
				<label for="new-name">Name *</label>
				<input
					id="new-name"
					type="text"
					bind:value={newName}
					placeholder="Enter category name..."
					disabled={adding}
				/>
			</div>
			<div class="form-group">
				<label for="new-slug">Slug</label>
				<input
					id="new-slug"
					type="text"
					bind:value={newSlug}
					placeholder="auto-generated-slug"
					oninput={handleSlugEdit}
					disabled={adding}
				/>
				<span class="hint">Leave blank to auto-generate from name</span>
			</div>
			<div class="form-actions">
				<button onclick={addCategory} disabled={adding || !newName.trim()} class="btn-primary">
					{adding ? 'Adding...' : 'Add Category'}
				</button>
			</div>
		</div>
	</div>

	<!-- Categories Table -->
	<div class="table-container">
		{#if categories.length === 0}
			<div class="empty-state">
				<p>No categories yet. Add your first category above.</p>
			</div>
		{:else}
			<table class="categories-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Slug</th>
						<th>Posts</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each categories as category}
						<tr>
							{#if editingId === category.id}
								<!-- Edit Mode -->
								<td>
									<input
										type="text"
										bind:value={editName}
										placeholder="Category name"
										disabled={saving}
										class="edit-input"
									/>
								</td>
								<td>
									<input
										type="text"
										bind:value={editSlug}
										placeholder="category-slug"
										oninput={handleEditSlugChange}
										disabled={saving}
										class="edit-input"
									/>
								</td>
								<td>
									<span class="badge">{getCategoryPostCount(category)}</span>
								</td>
								<td>
									<div class="action-buttons">
										<button
											onclick={saveEdit}
											disabled={saving || !editName.trim()}
											class="btn-small btn-primary"
										>
											{saving ? 'Saving...' : 'Save'}
										</button>
										<button onclick={cancelEdit} disabled={saving} class="btn-small btn-secondary">
											Cancel
										</button>
									</div>
								</td>
							{:else if deletingId === category.id}
								<!-- Delete Confirmation -->
								<td colspan="4" class="delete-confirm">
									<div class="confirm-content">
										<span class="confirm-text">
											Delete "{category.name}"?
											{#if getCategoryPostCount(category) > 0}
												This will affect {getCategoryPostCount(category)} post(s) (they'll become uncategorized).
											{/if}
										</span>
										<div class="action-buttons">
											<button
												onclick={() => deleteCategory(category.id)}
												disabled={deleting}
												class="btn-small btn-danger"
											>
												{deleting ? 'Deleting...' : 'Delete'}
											</button>
											<button
												onclick={cancelDelete}
												disabled={deleting}
												class="btn-small btn-secondary"
											>
												Cancel
											</button>
										</div>
									</div>
								</td>
							{:else}
								<!-- View Mode -->
								<td>{category.name}</td>
								<td><code>{category.slug}</code></td>
								<td>
									<span class="badge">{getCategoryPostCount(category)}</span>
								</td>
								<td>
									<div class="action-buttons">
										<button onclick={() => startEdit(category)} class="btn-small btn-secondary">
											Edit
										</button>
										<button onclick={() => confirmDelete(category.id)} class="btn-small btn-danger">
											Delete
										</button>
									</div>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.categories-page {
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
		background: hsl(var(--primary) / 0.1);
		border: 1px solid hsl(var(--primary));
		color: hsl(var(--foreground));
	}

	.error-message {
		background: hsl(var(--destructive) / 0.1);
		border-color: hsl(var(--destructive));
		color: hsl(var(--destructive));
	}

	.add-form {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.add-form h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin-bottom: 1rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 1rem;
		align-items: end;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	input[type='text'] {
		padding: 0.75rem 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	input[type='text']:focus {
		outline: none;
		border-color: hsl(var(--primary));
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
	}

	input[type='text']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.hint {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	.form-actions {
		display: flex;
		align-items: flex-end;
	}

	.table-container {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.categories-table {
		width: 100%;
		border-collapse: collapse;
	}

	.categories-table thead {
		background: hsl(var(--muted) / 0.5);
	}

	.categories-table th {
		padding: 1rem;
		text-align: left;
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		border-bottom: 1px solid hsl(var(--border));
	}

	.categories-table td {
		padding: 1rem;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		border-bottom: 1px solid hsl(var(--border));
	}

	.categories-table tbody tr:last-child td {
		border-bottom: none;
	}

	.categories-table tbody tr:hover {
		background: hsl(var(--muted) / 0.3);
	}

	.edit-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.25rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.delete-confirm {
		background: hsl(var(--destructive) / 0.05);
	}

	.confirm-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
	}

	.confirm-text {
		font-size: 0.875rem;
		color: hsl(var(--destructive));
		font-weight: 500;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.75rem;
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	code {
		padding: 0.25rem 0.5rem;
		background: hsl(var(--muted));
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
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

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-danger {
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
	}

	.btn-danger:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-danger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-state {
		padding: 3rem 2rem;
		text-align: center;
	}

	.empty-state p {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	@media (max-width: 768px) {
		.categories-page {
			padding: 1rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.form-actions {
			width: 100%;
		}

		.btn-primary {
			width: 100%;
		}

		.categories-table {
			font-size: 0.75rem;
		}

		.categories-table th,
		.categories-table td {
			padding: 0.75rem 0.5rem;
		}

		.action-buttons {
			flex-direction: column;
		}

		.btn-small {
			width: 100%;
		}
	}
</style>
