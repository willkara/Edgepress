<script lang="ts">
	import type { NodeViewProps } from '@tiptap/core';
	import {
		uploadImageToCloudflare,
		validateImageFile,
		formatFileSize
	} from '$lib/utils/image-upload';
	import type { UploadProgress } from '$lib/utils/image-upload';

	const { editor }: NodeViewProps = $props();

	let uploading = $state(false);
	let uploadProgress = $state<UploadProgress | null>(null);
	let error = $state('');
	let fileInputRef: HTMLInputElement;
	let dragActive = $state(false);
	let urlMode = $state(false);
	let urlInput = $state('');

	async function handleFileSelect(file: File) {
		error = '';

		// Validate file
		try {
			validateImageFile(file, {
				maxSize: 10 * 1024 * 1024, // 10MB
				allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
			});
		} catch (err: any) {
			error = err.message;
			return;
		}

		uploading = true;
		uploadProgress = null;

		try {
			const result = await uploadImageToCloudflare(file, (progress) => {
				uploadProgress = progress;
			});

			// Insert image with CF Images URL and tracking attributes
			const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

			editor
				.chain()
				.focus()
				.setImage({
					src: result.url,
					alt: altText,
					'data-media-id': result.mediaId,
					'data-cf-image-id': result.imageId
				} as any)
				.run();
		} catch (err: any) {
			error = err.message || 'Upload failed';
		} finally {
			uploading = false;
			uploadProgress = null;
		}
	}

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;

		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			handleFileSelect(file);
		} else {
			error = 'Please drop an image file';
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;
	}

	function handlePaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				e.preventDefault();
				const file = item.getAsFile();
				if (file) {
					handleFileSelect(file);
				}
				break;
			}
		}
	}

	function handleUrlInsert() {
		if (!urlInput.trim()) {
			error = 'Please enter a URL';
			return;
		}

		try {
			new URL(urlInput.trim()); // Validate URL
		} catch {
			error = 'Invalid URL';
			return;
		}

		editor
			.chain()
			.focus()
			.setImage({
				src: urlInput.trim()
			})
			.run();

		urlInput = '';
		urlMode = false;
	}

	function toggleUrlMode() {
		urlMode = !urlMode;
		error = '';
		urlInput = '';
	}
</script>

<svelte:window onpaste={handlePaste} />

<div class="image-uploader">
	{#if uploading}
		<!-- Upload Progress -->
		<div class="upload-progress">
			<div class="progress-info">
				<svg class="spinner" viewBox="0 0 50 50">
					<circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
				</svg>
				<span>Uploading{uploadProgress ? ` ${uploadProgress.percentage}%` : '...'}</span>
			</div>
			{#if uploadProgress}
				<div class="progress-bar-container">
					<div class="progress-bar" style="width: {uploadProgress.percentage}%"></div>
				</div>
				<div class="progress-details">
					{formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
				</div>
			{/if}
		</div>
	{:else if urlMode}
		<!-- URL Input Mode -->
		<div class="url-input-container">
			<input
				type="url"
				bind:value={urlInput}
				placeholder="Enter image URL..."
				class="url-input"
				onkeydown={(e) => e.key === 'Enter' && handleUrlInsert()}
			/>
			<div class="url-actions">
				<button type="button" onclick={handleUrlInsert} class="btn-primary">Insert</button>
				<button type="button" onclick={toggleUrlMode} class="btn-secondary">Cancel</button>
			</div>
		</div>
	{:else}
		<!-- Upload Zone -->
		<div
			class="upload-zone"
			class:drag-active={dragActive}
			role="button"
			tabindex="0"
			aria-label="Upload image"
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			onclick={() => fileInputRef?.click()}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					fileInputRef?.click();
				}
			}}
		>
			<div class="upload-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="17 8 12 3 7 8"></polyline>
					<line x1="12" y1="3" x2="12" y2="15"></line>
				</svg>
			</div>
			<div class="upload-text">
				<p class="upload-main">Drop an image here, or click to browse</p>
				<p class="upload-hint">You can also paste from clipboard</p>
				<p class="upload-hint">Max 10MB · JPG, PNG, GIF, WebP</p>
			</div>
			<button type="button" onclick={() => fileInputRef?.click()} class="btn-upload">
				Choose File
			</button>
			<button type="button" onclick={toggleUrlMode} class="btn-link">Or insert from URL</button>
		</div>
	{/if}

	{#if error}
		<div class="error-message">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<span>{error}</span>
		</div>
	{/if}

	<input
		type="file"
		accept="image/*"
		bind:this={fileInputRef}
		onchange={handleInputChange}
		style="display: none;"
	/>
</div>

<style>
	.image-uploader {
		padding: 1rem;
		min-height: 200px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.upload-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		border: 2px dashed hsl(var(--border));
		border-radius: 0.5rem;
		background: hsl(var(--background));
		transition: all 0.2s;
		cursor: pointer;
	}

	.upload-zone:hover {
		border-color: hsl(var(--primary));
		background: hsl(var(--muted) / 0.3);
	}

	.upload-zone.drag-active {
		border-color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.1);
		transform: scale(1.02);
	}

	.upload-icon svg {
		width: 48px;
		height: 48px;
		color: hsl(var(--muted-foreground));
	}

	.upload-text {
		text-align: center;
	}

	.upload-main {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
		margin-bottom: 0.5rem;
	}

	.upload-hint {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		margin: 0.25rem 0;
	}

	.btn-upload {
		padding: 0.5rem 1.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-upload:hover {
		opacity: 0.9;
	}

	.btn-link {
		padding: 0.25rem;
		background: transparent;
		color: hsl(var(--primary));
		border: none;
		font-size: 0.75rem;
		cursor: pointer;
		text-decoration: underline;
	}

	.upload-progress {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 2rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.5rem;
	}

	.progress-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
	}

	.spinner {
		width: 24px;
		height: 24px;
		animation: rotate 1s linear infinite;
	}

	.spinner circle {
		stroke: hsl(var(--primary));
		stroke-linecap: round;
		animation: dash 1.5s ease-in-out infinite;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes dash {
		0% {
			stroke-dasharray: 1, 150;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -124;
		}
	}

	.progress-bar-container {
		width: 100%;
		height: 4px;
		background: hsl(var(--muted));
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: hsl(var(--primary));
		transition: width 0.3s ease;
	}

	.progress-details {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		text-align: center;
	}

	.url-input-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.5rem;
	}

	.url-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.url-input:focus {
		outline: none;
		border-color: hsl(var(--primary));
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
	}

	.url-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-primary {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.btn-secondary {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.btn-primary:hover,
	.btn-secondary:hover {
		opacity: 0.9;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive));
		border-radius: 0.375rem;
		color: hsl(var(--destructive));
		font-size: 0.875rem;
	}

	.error-message svg {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}
</style>
