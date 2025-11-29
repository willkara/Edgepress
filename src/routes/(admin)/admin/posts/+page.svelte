<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchInput = $state(data.filters.search);
	let statusFilter = $state(data.filters.status);
	let deleting = $state<string | null>(null);

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchInput) params.set('search', searchInput);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		params.set('page', '1');
		goto(`/admin/posts?${params.toString()}`);
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`/admin/posts?${params.toString()}`);
	}

	async function deletePost(id: string, title: string) {
		if (!confirm(`Are you sure you want to delete "${title}"?`)) {
			return;
		}

		deleting = id;

		try {
			const response = await fetch(`/api/admin/posts/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Reload the page to refresh the list
				window.location.reload();
			} else {
				const error = await response.json();
				alert(`Failed to delete post: ${error.message || 'Unknown error'}`);
			}
		} catch (err) {
			alert('Failed to delete post. Please try again.');
		} finally {
			deleting = null;
		}
	}

	async function togglePublish(id: string, currentStatus: 'draft' | 'published') {
		const action = currentStatus === 'published' ? 'unpublish' : 'publish';

		try {
			const response = await fetch(`/api/admin/posts/${id}/${action}`, {
				method: 'PATCH'
			});

			if (response.ok) {
				window.location.reload();
			} else {
				const error = await response.json();
				alert(`Failed to ${action} post: ${error.message || 'Unknown error'}`);
			}
		} catch (err) {
			alert(`Failed to ${action} post. Please try again.`);
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
	<title>Posts - EdgePress Admin</title>
</svelte:head>

<div class="posts-page">
	<div class="page-header">
		<h1>Posts</h1>
		<a href="/admin/posts/new" class="btn-primary">Create New Post</a>
	</div>

	<div class="filters">
		<div class="search-box">
			<input
				type="text"
				bind:value={searchInput}
				placeholder="Search posts..."
				onkeydown={(e) => e.key === 'Enter' && applyFilters()}
			/>
			<button onclick={applyFilters} class="btn-secondary">Search</button>
		</div>

		<div class="filter-group">
			<label for="status">Status:</label>
			<select id="status" bind:value={statusFilter} onchange={applyFilters}>
				<option value="all">All</option>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
			</select>
		</div>

		<div class="results-count">
			{data.total} post{data.total !== 1 ? 's' : ''} found
		</div>
	</div>

	{#if data.posts.length === 0}
		<div class="empty-state">
			<p>No posts found.</p>
			<a href="/admin/posts/new" class="btn-primary">Create your first post</a>
		</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Status</th>
						<th>Author</th>
						<th>Category</th>
						<th>Published</th>
						<th>Updated</th>
						<th class="actions-col">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.posts as post}
						<tr>
							<td>
								<a href="/admin/posts/{post.id}/edit" class="post-title">{post.title}</a>
							</td>
							<td>
								<span class="status-badge" data-status={post.status}>
									{post.status}
								</span>
							</td>
							<td>{post.author_name}</td>
							<td>{post.category_name || '—'}</td>
							<td>{formatDate(post.published_at)}</td>
							<td>{formatDate(post.updated_at)}</td>
							<td class="actions">
								<a href="/admin/posts/{post.id}/edit" class="btn-icon" title="Edit"> ✏️ </a>
								<button
									onclick={() => togglePublish(post.id, post.status)}
									class="btn-icon"
									title={post.status === 'published' ? 'Unpublish' : 'Publish'}
								>
									{post.status === 'published' ? '📥' : '📤'}
								</button>
								<button
									onclick={() => deletePost(post.id, post.title)}
									class="btn-icon btn-danger"
									disabled={deleting === post.id}
									title="Delete"
								>
									{deleting === post.id ? '⏳' : '🗑️'}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if data.totalPages > 1}
			<div class="pagination">
				<button
					onclick={() => goToPage(data.currentPage - 1)}
					disabled={data.currentPage === 1}
					class="btn-secondary"
				>
					Previous
				</button>

				<span class="page-info">
					Page {data.currentPage} of {data.totalPages}
				</span>

				<button
					onclick={() => goToPage(data.currentPage + 1)}
					disabled={data.currentPage === data.totalPages}
					class="btn-secondary"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.posts-page {
		padding: 1rem;
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

	.filters {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		background: var(--bg-elevated);
		padding: 1rem;
		border-radius: 0.75rem;
		border: 1px solid var(--border-subtle);
	}

	.search-box {
		display: flex;
		gap: 0.5rem;
		flex: 1;
		min-width: 300px;
	}

	.search-box input {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		background: var(--bg-page);
		color: var(--text-main);
		font-size: 0.875rem;
	}

	.search-box input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-muted);
	}

	.filter-group select {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		background: var(--bg-page);
		color: var(--text-main);
		font-size: 0.875rem;
	}

	.results-count {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin-left: auto;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bg-elevated);
		border-radius: 0.75rem;
		border: 1px solid var(--border-subtle);
	}

	.empty-state p {
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.table-container {
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
		overflow: hidden;
		background: var(--bg-elevated);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: var(--bg-soft);
	}

	th {
		padding: 0.9rem 1.2rem;
		text-align: left;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border-subtle);
	}

	td {
		padding: 1rem 1.2rem;
		font-size: 0.9rem;
		color: var(--text-main);
		border-bottom: 1px solid var(--border-subtle);
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr:hover {
		background: rgba(255, 255, 255, 0.02);
	}

	.post-title {
		color: var(--text-main);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.95rem;
	}

	.post-title:hover {
		color: var(--accent);
	}

	.status-badge {
		display: inline-block;
		padding: 0.2rem 0.6rem;
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge[data-status='published'] {
		background: rgba(16, 185, 129, 0.15);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	.status-badge[data-status='draft'] {
		background: rgba(148, 163, 184, 0.15);
		color: #cbd5e1;
		border: 1px solid rgba(148, 163, 184, 0.2);
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions-col {
		width: 130px;
	}

	.btn-icon {
		padding: 0.4rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.15s;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.btn-icon:hover:not(:disabled) {
		background: var(--bg-soft);
		color: var(--text-main);
		border-color: var(--border-subtle);
	}

	.btn-icon:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-icon.btn-danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
		border-color: rgba(239, 68, 68, 0.3);
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
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.15s;
	}

	.btn-primary:hover {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	.btn-secondary {
		padding: 0.6rem 1.2rem;
		background: var(--bg-elevated);
		color: var(--text-main);
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
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

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.page-info {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	@media (max-width: 768px) {
		.posts-page {
			padding: 0;
		}

		.filters {
			flex-direction: column;
			align-items: stretch;
		}

		.search-box {
			min-width: 100%;
		}

		.results-count {
			margin-left: 0;
		}

		.table-container {
			overflow-x: auto;
		}

		table {
			min-width: 800px;
		}
	}
</style>
