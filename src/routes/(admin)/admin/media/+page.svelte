<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { formatFileSize } from '$lib/utils/image-upload';

	let { data }: { data: PageData } = $props();

	let media = $state(data.media);
	let filter = $state(data.filter);
	let cfImagesHash = $state(data.cfImagesHash);

	// Modal state
	let selectedMedia = $state<any>(null);
	let showModal = $state(false);
	let deleting = $state(false);
	let error = $state('');

	function getImageUrl(cfImageId: string) {
		return `https://imagedelivery.net/${cfImagesHash}/${cfImageId}/public`;
	}

	function filterMedia(newFilter: 'all' | 'used' | 'orphaned') {
		filter = newFilter;
		goto(`?filter=${newFilter}`, { replaceState: true });
	}

	function openModal(item: any) {
		selectedMedia = item;
		showModal = true;
		error = '';
	}

	function closeModal() {
		showModal = false;
		selectedMedia = null;
		error = '';
	}

	async function deleteImage() {
		if (!selectedMedia || selectedMedia.usage_count > 0) {
			error = 'Cannot delete image that is in use';
			return;
		}

		if (!confirm(`Delete "${selectedMedia.filename}"? This action cannot be undone.`)) {
			return;
		}

		deleting = true;
		error = '';

		try {
			const response = await fetch(`/api/admin/media/${selectedMedia.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				media = media.filter((m) => m.id !== selectedMedia.id);
				closeModal();
				await invalidateAll();
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Failed to delete image';
			}
		} catch (err: any) {
			error = err.message || 'Failed to delete image';
		} finally {
			deleting = false;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Media Library - EdgePress</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1>Media Library</h1>
		<div class="stats">
			<span>{media.length} image{media.length !== 1 ? 's' : ''}</span>
		</div>
	</header>

	<!-- Filter Tabs -->
	<nav class="filter-tabs">
		<button class="tab" class:active={filter === 'all'} onclick={() => filterMedia('all')}>
			All
		</button>
		<button class="tab" class:active={filter === 'used'} onclick={() => filterMedia('used')}>
			Used
		</button>
		<button
			class="tab"
			class:active={filter === 'orphaned'}
			onclick={() => filterMedia('orphaned')}
		>
			Orphaned
		</button>
	</nav>

	<!-- Media Grid -->
	{#if media.length === 0}
		<div class="empty-state">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
				<circle cx="8.5" cy="8.5" r="1.5"></circle>
				<polyline points="21 15 16 10 5 21"></polyline>
			</svg>
			<p>No images found</p>
			<small>Upload images through the post editor</small>
		</div>
	{:else}
		<div class="media-grid">
			{#each media as item (item.id)}
				<button class="media-item" onclick={() => openModal(item)}>
					<div class="image-container">
						<img src={getImageUrl(item.cf_image_id)} alt={item.alt_text || item.filename} />
						{#if item.usage_count > 0}
							<span class="usage-badge">{item.usage_count}</span>
						{/if}
					</div>
					<div class="media-info">
						<span class="filename" title={item.filename}>{item.filename}</span>
						<span class="file-size">{item.file_size ? formatFileSize(item.file_size) : 'N/A'}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal && selectedMedia}
	<div
		class="modal-overlay"
		role="button"
		tabindex="0"
		onclick={closeModal}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				closeModal();
			}
			if (e.key === 'Escape') {
				closeModal();
			}
		}}
	>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					closeModal();
				}
			}}
		>
			<div class="modal-header">
				<h2>Image Details</h2>
				<button class="close-btn" aria-label="Close modal" onclick={closeModal}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<div class="preview-image">
					<img
						src={getImageUrl(selectedMedia.cf_image_id)}
						alt={selectedMedia.alt_text || selectedMedia.filename}
					/>
				</div>

				<dl class="details-list">
					<div class="detail-row">
						<dt>Filename</dt>
						<dd>{selectedMedia.filename}</dd>
					</div>

					{#if selectedMedia.width && selectedMedia.height}
						<div class="detail-row">
							<dt>Dimensions</dt>
							<dd>{selectedMedia.width} × {selectedMedia.height}px</dd>
						</div>
					{/if}

					{#if selectedMedia.file_size}
						<div class="detail-row">
							<dt>Size</dt>
							<dd>{formatFileSize(selectedMedia.file_size)}</dd>
						</div>
					{/if}

					<div class="detail-row">
						<dt>Uploaded</dt>
						<dd>{formatDate(selectedMedia.created_at)}</dd>
					</div>

					<div class="detail-row">
						<dt>Usage</dt>
						<dd>{selectedMedia.usage_count} post{selectedMedia.usage_count !== 1 ? 's' : ''}</dd>
					</div>
				</dl>

				{#if selectedMedia.posts && selectedMedia.posts.length > 0}
					<div class="usage-section">
						<h3>Used in posts:</h3>
						<ul class="usage-list">
							{#each selectedMedia.posts as post}
								<li>
									<a href="/admin/posts/{post.id}">
										{post.title}
										<span class="usage-type">({post.usage_type})</span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if error}
					<div class="error-message">
						{error}
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				{#if selectedMedia.usage_count === 0}
					<button class="btn-danger" onclick={deleteImage} disabled={deleting}>
						{deleting ? 'Deleting...' : 'Delete Image'}
					</button>
				{:else}
					<p class="warning-text">
						Cannot delete: image is used in {selectedMedia.usage_count} post{selectedMedia.usage_count !==
						1
							? 's'
							: ''}
					</p>
				{/if}
				<button class="btn-secondary" onclick={closeModal}>Close</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
	}

	.stats {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.filter-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid hsl(var(--border));
	}

	.tab {
		padding: 0.75rem 1.5rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		color: hsl(var(--foreground));
	}

	.tab.active {
		color: hsl(var(--primary));
		border-bottom-color: hsl(var(--primary));
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		color: hsl(var(--muted-foreground));
	}

	.empty-state svg {
		width: 64px;
		height: 64px;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-state p {
		font-size: 1.125rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.empty-state small {
		font-size: 0.875rem;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.media-item {
		display: flex;
		flex-direction: column;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s;
	}

	.media-item:hover {
		border-color: hsl(var(--primary));
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.image-container {
		position: relative;
		width: 100%;
		padding-top: 75%;
		background: hsl(var(--muted));
		overflow: hidden;
	}

	.image-container img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.usage-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 0.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.media-info {
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		gap: 0.25rem;
	}

	.filename {
		font-size: 0.875rem;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.file-size {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: hsl(var(--background));
		border-radius: 0.5rem;
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
	}

	.modal-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: none;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		color: hsl(var(--muted-foreground));
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.close-btn svg {
		width: 20px;
		height: 20px;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.preview-image {
		width: 100%;
		max-height: 300px;
		margin-bottom: 1.5rem;
		background: hsl(var(--muted));
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.preview-image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.details-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0 0 1.5rem;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
	}

	.detail-row dt {
		font-weight: 500;
		color: hsl(var(--muted-foreground));
	}

	.detail-row dd {
		font-weight: 500;
		margin: 0;
	}

	.usage-section {
		margin-top: 1.5rem;
	}

	.usage-section h3 {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.usage-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.usage-list li a {
		display: inline-block;
		padding: 0.5rem;
		background: hsl(var(--muted));
		border-radius: 0.25rem;
		font-size: 0.875rem;
		text-decoration: none;
		color: hsl(var(--foreground));
		transition: background 0.2s;
	}

	.usage-list li a:hover {
		background: hsl(var(--muted) / 0.7);
	}

	.usage-type {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		margin-left: 0.5rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid hsl(var(--border));
	}

	.btn-danger {
		padding: 0.5rem 1rem;
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-danger:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-danger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		padding: 0.5rem 1rem;
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-secondary:hover {
		opacity: 0.9;
	}

	.warning-text {
		flex: 1;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.error-message {
		padding: 0.75rem;
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive));
		border-radius: 0.375rem;
		color: hsl(var(--destructive));
		font-size: 0.875rem;
		margin-top: 1rem;
	}
</style>
