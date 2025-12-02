<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let deleting = $state<string | null>(null);

	async function deletePage(id: string, title: string) {
		if (!confirm(`Are you sure you want to delete "${title}"?`)) {
			return;
		}

		deleting = id;

		try {
			const response = await fetch(`/api/admin/pages/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Reload the page to refresh the list
				window.location.reload();
			} else {
				const error = await response.json();
				alert(`Failed to delete page: ${error.message || 'Unknown error'}`);
			}
		} catch (err) {
			alert('Failed to delete page. Please try again.');
		} finally {
			deleting = null;
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Never';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Pages - EdgePress Admin</title>
</svelte:head>

<div class="pages-page">
	<div class="page-header">
		<div>
			<h1>Static Pages</h1>
			<p class="page-description">
				Manage static pages like About, Contact, Privacy Policy, etc.
			</p>
		</div>
		<a href="/admin/pages/new" class="btn-primary">Create New Page</a>
	</div>

	<div class="results-count">
		{data.total} page{data.total !== 1 ? 's' : ''} total
	</div>

	{#if data.pages.length === 0}
		<div class="empty-state">
			<p>No pages found.</p>
			<p class="help-text">
				Pages are static content like "About", "Contact", or "Privacy Policy" that appear at URLs like <code>/about</code> or <code>/contact</code>.
			</p>
			<a href="/admin/pages/new" class="btn-primary">Create your first page</a>
		</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Slug</th>
						<th>Status</th>
						<th>Template</th>
						<th>Author</th>
						<th>Published</th>
						<th>Updated</th>
						<th class="actions-col">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.pages as page}
						<tr>
							<td>
								<a href="/admin/pages/{page.id}/edit" class="page-title">{page.title}</a>
							</td>
							<td>
								<code class="slug">/{page.slug}</code>
							</td>
							<td>
								<span class="status-badge" data-status={page.status}>
									{page.status}
								</span>
							</td>
							<td>
								<code class="template">{page.template}</code>
							</td>
							<td>{page.author_name}</td>
							<td>{formatDate(page.published_at)}</td>
							<td>{formatDate(page.updated_at)}</td>
							<td class="actions">
								<a href="/admin/pages/{page.id}/edit" class="btn-icon" title="Edit"> ✏️ </a>
								{#if page.status === 'published'}
									<a href="/{page.slug}" class="btn-icon" title="View Page" target="_blank"> 👁️ </a>
								{/if}
								<button
									onclick={() => deletePage(page.id, page.title)}
									class="btn-icon btn-danger"
									disabled={deleting === page.id}
									title="Delete"
								>
									{deleting === page.id ? '⏳' : '🗑️'}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.pages-page {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		gap: 1rem;
	}

	.page-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		font-weight: 600;
	}

	.page-description {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.95rem;
	}

	.results-count {
		margin-bottom: 1rem;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--surface);
		border-radius: 8px;
		border: 1px dashed var(--border);
	}

	.empty-state p {
		margin-bottom: 1rem;
		color: var(--text-muted);
	}

	.help-text {
		font-size: 0.9rem;
		max-width: 500px;
		margin: 0 auto 1.5rem;
	}

	.empty-state code {
		background: var(--code-bg);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
	}

	.table-container {
		overflow-x: auto;
		background: var(--surface);
		border-radius: 8px;
		border: 1px solid var(--border);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: var(--surface-hover);
		border-bottom: 2px solid var(--border);
	}

	th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.85rem;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid var(--border);
	}

	tr:hover {
		background: var(--surface-hover);
	}

	.page-title {
		font-weight: 500;
		color: var(--text);
		text-decoration: none;
	}

	.page-title:hover {
		color: var(--accent);
		text-decoration: underline;
	}

	.slug, .template {
		background: var(--code-bg);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		color: var(--accent);
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-badge[data-status='published'] {
		background: #d1fae5;
		color: #065f46;
	}

	.status-badge[data-status='draft'] {
		background: #fee2e2;
		color: #991b1b;
	}

	.actions-col {
		width: 120px;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.btn-primary {
		display: inline-block;
		padding: 0.625rem 1.25rem;
		background: var(--accent);
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
		transition: background 150ms;
	}

	.btn-primary:hover {
		background: var(--accent-hover);
	}

	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0.25rem;
		opacity: 0.7;
		transition: opacity 150ms, transform 150ms;
		text-decoration: none;
		display: inline-block;
	}

	.btn-icon:hover:not(:disabled) {
		opacity: 1;
		transform: scale(1.1);
	}

	.btn-icon:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.btn-danger:hover:not(:disabled) {
		filter: hue-rotate(-10deg) brightness(1.2);
	}
</style>
