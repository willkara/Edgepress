<script lang="ts">
	import type { PageData } from './$types';
	import StatsCard from '$lib/components/admin/StatsCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard - EdgePress Admin</title>
</svelte:head>

<div class="dashboard">
	<div class="dashboard-header">
		<h1>Dashboard</h1>
		<p class="subtitle">Welcome back! Here's an overview of your blog.</p>
	</div>

	<div class="stats-grid">
		<StatsCard icon="📝" label="Total Posts" value={data.stats.totalPosts} color="primary" />
		<StatsCard icon="✅" label="Published" value={data.stats.publishedPosts} color="success" />
		<StatsCard icon="📄" label="Drafts" value={data.stats.draftPosts} color="warning" />
		<StatsCard icon="📂" label="Categories" value={data.stats.totalCategories} color="info" />
		<StatsCard icon="🏷️" label="Tags" value={data.stats.totalTags} color="info" />
		<StatsCard icon="🖼️" label="Media Files" value={data.stats.totalMedia} color="secondary" />
	</div>

	<div class="quick-actions">
		<h2>Quick Actions</h2>
		<div class="actions-grid">
			<a href="/admin/posts/new" class="action-card">
				<div class="action-icon">✍️</div>
				<div class="action-content">
					<h3>New Post</h3>
					<p>Create a new blog post</p>
				</div>
			</a>

			<a href="/admin/media" class="action-card">
				<div class="action-icon">📤</div>
				<div class="action-content">
					<h3>Upload Media</h3>
					<p>Add images and files</p>
				</div>
			</a>

			<a href="/admin/posts" class="action-card">
				<div class="action-icon">📋</div>
				<div class="action-content">
					<h3>Manage Posts</h3>
					<p>View and edit all posts</p>
				</div>
			</a>

			<a href="/admin/settings" class="action-card">
				<div class="action-icon">⚙️</div>
				<div class="action-content">
					<h3>Settings</h3>
					<p>Configure your blog</p>
				</div>
			</a>
		</div>
	</div>
</div>

<style>
	.dashboard {
		padding: 1rem;
	}

	.dashboard-header {
		margin-bottom: 2.5rem;
	}

	.dashboard-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: 0.5rem;
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 0.95rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3.5rem;
	}

	.quick-actions {
		margin-top: 2rem;
	}

	.quick-actions h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin-bottom: 1.5rem;
		letter-spacing: -0.01em;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.5rem;
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1.5rem;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.action-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: var(--shadow-soft);
		background: linear-gradient(to bottom right, var(--bg-elevated), rgba(56, 189, 248, 0.05));
	}

	.action-icon {
		font-size: 1.8rem;
		line-height: 1;
		opacity: 0.9;
	}

	.action-content {
		flex: 1;
	}

	.action-content h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 0.25rem 0;
	}

	.action-content p {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin: 0;
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 0;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
