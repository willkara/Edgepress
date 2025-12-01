<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetFooter,
		SheetHeader,
		SheetTitle
	} from '$lib/components/ui/sheet';
	import { Toggle } from '$lib/components/ui/toggle';
	import type { MediaWithUsage } from '$lib/server/db/media';
	import { formatFileSize } from '$lib/utils/image-upload';

	type UploadStatus = 'queued' | 'uploading' | 'completed' | 'error';

	type UploadItem = {
		id: string;
		file: File;
		status: UploadStatus;
		progress: number;
		error?: string;
	};

	let { data }: { data: PageData } = $props();

	let media = $state<MediaWithUsage[]>(data.media);
	let filter = $state<'all' | 'used' | 'orphaned'>(data.filter);
	let cfImagesHash = $state(data.cfImagesHash);

	let uploadQueue = $state<UploadItem[]>([]);
	let uploadOpen = $state(false);
	let uploading = $state(false);
	let dropActive = $state(false);
	let autoAltFromFilename = $state(true);

	let selectedMedia = $state<MediaWithUsage | null>(null);
	let detailsOpen = $state(false);
	let deleting = $state(false);
	let error = $state('');

	$effect(() => {
		if (!detailsOpen) {
			selectedMedia = null;
			error = '';
		}
	});

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	const activeUploads = $derived(
		uploadQueue.filter((item) => item.status === 'uploading' || item.status === 'queued')
	);

	function getImageUrl(cfImageId: string) {
		return `https://imagedelivery.net/${cfImagesHash}/${cfImageId}/public`;
	}

	function filterMedia(newFilter: 'all' | 'used' | 'orphaned') {
		filter = newFilter;
		goto(`?filter=${newFilter}`, { replaceState: true });
	}

	function openDetails(item: MediaWithUsage) {
		selectedMedia = item;
		error = '';
		detailsOpen = true;
	}

	function closeDetails() {
		detailsOpen = false;
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
				media = media.filter((m) => m.id !== selectedMedia?.id);
				closeDetails();
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

	function addFiles(files: FileList | File[]) {
		const incoming = Array.from(files).filter((file) => file.type.startsWith('image/'));
		const nextQueue = [...uploadQueue];

		for (const file of incoming) {
			const duplicate = nextQueue.find(
				(item) => `${item.file.name}-${item.file.size}` === `${file.name}-${file.size}`
			);

			if (!duplicate) {
				nextQueue.push({
					id: crypto.randomUUID(),
					file,
					progress: 0,
					status: 'queued'
				});
			}
		}

		uploadQueue = nextQueue;
	}

	function handleFileInput(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			addFiles(target.files);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dropActive = false;
		if (event.dataTransfer?.files) {
			addFiles(event.dataTransfer.files);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dropActive = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dropActive = false;
	}

	async function uploadQueueItems() {
		if (uploadQueue.length === 0) return;

		uploading = true;

		for (const item of uploadQueue) {
			if (item.status === 'completed') continue;

			item.status = 'uploading';
			item.progress = 10;
			uploadQueue = [...uploadQueue];

			try {
				const formData = new FormData();
				formData.append('files', item.file);
				formData.append('autoAltFromFilename', autoAltFromFilename ? 'true' : 'false');

				const response = await fetch('/api/admin/media/upload', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Upload failed');
				}

				const result = await response.json();
				const uploadResult = result.uploads?.[0];

				if (!uploadResult) {
					throw new Error('No upload result returned');
				}

				const newMedia: MediaWithUsage = {
					id: uploadResult.mediaId,
					cf_image_id: uploadResult.imageId,
					filename: uploadResult.filename,
					uploaded_by: 'you',
					width: uploadResult.width ?? null,
					height: uploadResult.height ?? null,
					file_size: item.file.size,
					mime_type: item.file.type,
					alt_text: uploadResult.altText ?? null,
					usage_count: 0,
					created_at: new Date().toISOString(),
					posts: []
				};

				media = [newMedia, ...media];

				item.status = 'completed';
				item.progress = 100;
			} catch (err: any) {
				item.status = 'error';
				item.error = err?.message || 'Upload failed';
			} finally {
				uploadQueue = [...uploadQueue];
			}
		}

		uploading = false;
		await invalidateAll();
	}

	function clearCompleted() {
		uploadQueue = uploadQueue.filter((item) => item.status !== 'completed');
	}
</script>

<svelte:head>
	<title>Media Library - EdgePress</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="space-y-2">
			<p class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Media</p>
			<div class="space-y-1">
				<h1 class="text-3xl font-semibold">Media Library</h1>
				<p class="text-muted-foreground">
					Manage images uploaded through the editor or directly from this library.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" onclick={() => invalidateAll()}>Refresh</Button>
			<Sheet bind:open={uploadOpen}>
				<Button onclick={() => (uploadOpen = true)}>Upload images</Button>
				<SheetContent side="right" class="w-full max-w-lg">
					<SheetHeader class="space-y-2">
						<SheetTitle>Upload to library</SheetTitle>
						<SheetDescription>
							Add multiple photos at once. Images are stored in Cloudflare Images and referenced
							from D1.
						</SheetDescription>
					</SheetHeader>

					<div
						class={`mt-4 rounded-lg border border-dashed p-6 transition-colors ${dropActive ? 'border-primary/60 bg-primary/5' : 'border-muted'}`}
						class:drop-active={dropActive}
						role="button"
						aria-label="Upload files"
						tabindex="0"
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						ondrop={handleDrop}
					>
						<div class="flex flex-col items-start gap-3">
							<div>
								<p class="text-base font-semibold">Drag and drop</p>
								<p class="text-sm text-muted-foreground">
									PNG, JPG, or WebP. You can add multiple files.
								</p>
							</div>
							<div class="flex flex-wrap items-center gap-3">
								<Input
									type="file"
									accept="image/*"
									multiple
									onchange={handleFileInput}
									class="max-w-xs"
								/>
								<Toggle bind:pressed={autoAltFromFilename} aria-label="Auto alt text">
									Auto alt text
								</Toggle>
							</div>
						</div>
					</div>

					{#if uploadQueue.length > 0}
						<div class="mt-6 space-y-4">
							<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div class="space-y-1">
									<p class="text-sm text-muted-foreground">
										{uploadQueue.length} item{uploadQueue.length === 1 ? '' : 's'} queued
									</p>
									{#if activeUploads.length > 0}
										<p class="text-sm text-muted-foreground">Uploading…</p>
									{/if}
								</div>
								<div class="flex flex-wrap items-center gap-2">
									<Button variant="ghost" size="sm" onclick={clearCompleted}>
										Clear completed
									</Button>
									<Button onclick={uploadQueueItems} disabled={uploading}>Start upload</Button>
								</div>
							</div>

							<div class="space-y-3">
								{#each uploadQueue as item (item.id)}
									<Card class="border-muted/60">
										<CardHeader class="flex flex-row items-start justify-between space-y-0">
											<div class="space-y-1">
												<p class="font-semibold leading-none">{item.file.name}</p>
												<p class="text-sm text-muted-foreground">
													{formatFileSize(item.file.size)}
												</p>
											</div>
											<Badge variant={item.status === 'error' ? 'destructive' : 'secondary'}>
												{item.status === 'queued'
													? 'Queued'
													: item.status === 'uploading'
														? 'Uploading'
														: item.status === 'completed'
															? 'Done'
															: 'Error'}
											</Badge>
										</CardHeader>
										<CardContent class="space-y-2 pt-0">
											<Progress value={item.progress} />
											{#if item.error}
												<p class="text-sm text-destructive">{item.error}</p>
											{/if}
										</CardContent>
									</Card>
								{/each}
							</div>
						</div>
					{:else}
						<div
							class="mt-6 rounded-lg border border-dashed border-muted px-4 py-6 text-center text-sm text-muted-foreground"
						>
							Add files to start a batch upload.
						</div>
					{/if}

					<SheetFooter class="mt-6">
						<Button variant="outline" onclick={() => (uploadOpen = false)}>Close</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	</div>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-wrap items-center gap-2">
			<Button
				variant={filter === 'all' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => filterMedia('all')}
			>
				All
			</Button>
			<Button
				variant={filter === 'used' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => filterMedia('used')}
			>
				Used
			</Button>
			<Button
				variant={filter === 'orphaned' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => filterMedia('orphaned')}
			>
				Orphaned
			</Button>
		</div>
		<p class="text-sm text-muted-foreground">{media.length} image{media.length !== 1 ? 's' : ''}</p>
	</div>

	{#if media.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted px-6 py-12 text-center text-muted-foreground"
		>
			<svg viewBox="0 0 24 24" class="size-12" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
				<circle cx="8.5" cy="8.5" r="1.5"></circle>
				<polyline points="21 15 16 10 5 21"></polyline>
			</svg>
			<div class="space-y-1">
				<p class="text-lg font-semibold text-foreground">No images found</p>
				<p class="text-sm">Upload images through the post editor or directly from this page.</p>
			</div>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each media as item (item.id)}
				<Card class="group cursor-pointer overflow-hidden" onclick={() => openDetails(item)}>
					<div class="relative overflow-hidden border-b">
						<img
							src={getImageUrl(item.cf_image_id)}
							alt={item.alt_text || item.filename}
							class="h-48 w-full object-cover transition duration-200 group-hover:scale-[1.01]"
						/>
						{#if item.usage_count > 0}
							<Badge class="absolute right-3 top-3">{item.usage_count}</Badge>
						{/if}
					</div>
					<CardContent class="space-y-1 p-4">
						<p class="truncate text-sm font-semibold" title={item.filename}>{item.filename}</p>
						<p class="text-xs text-muted-foreground">
							{item.file_size ? formatFileSize(item.file_size) : 'N/A'} · {dateFormatter.format(
								new Date(item.created_at)
							)}
						</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<Dialog bind:open={detailsOpen}>
	<DialogContent class="max-w-3xl">
		{#if selectedMedia}
			<DialogHeader class="space-y-2">
				<DialogTitle>Image Details</DialogTitle>
				<DialogDescription class="text-muted-foreground">
					Inspect metadata, usage, and delete orphaned assets.
				</DialogDescription>
			</DialogHeader>

			<div class="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
				<div class="space-y-4">
					<div class="overflow-hidden rounded-lg border">
						<img
							src={getImageUrl(selectedMedia.cf_image_id)}
							alt={selectedMedia.alt_text || selectedMedia.filename}
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
						<div class="space-y-1">
							<p class="text-muted-foreground">Filename</p>
							<p class="font-semibold text-foreground">{selectedMedia.filename}</p>
						</div>
						{#if selectedMedia.width && selectedMedia.height}
							<div class="space-y-1">
								<p class="text-muted-foreground">Dimensions</p>
								<p class="font-semibold text-foreground">
									{selectedMedia.width} × {selectedMedia.height}px
								</p>
							</div>
						{/if}
						{#if selectedMedia.file_size}
							<div class="space-y-1">
								<p class="text-muted-foreground">Size</p>
								<p class="font-semibold text-foreground">
									{formatFileSize(selectedMedia.file_size)}
								</p>
							</div>
						{/if}
						{#if selectedMedia.alt_text}
							<div class="space-y-1">
								<p class="text-muted-foreground">Alt text</p>
								<p class="font-semibold text-foreground">{selectedMedia.alt_text}</p>
							</div>
						{/if}
						<div class="space-y-1">
							<p class="text-muted-foreground">Uploaded</p>
							<p class="font-semibold text-foreground">
								{dateFormatter.format(new Date(selectedMedia.created_at))}
							</p>
						</div>
					</div>
				</div>

				<div class="space-y-4">
					<div class="rounded-lg border p-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-semibold text-foreground">Usage</p>
								<p class="text-sm text-muted-foreground">
									{selectedMedia.usage_count} post{selectedMedia.usage_count === 1 ? '' : 's'}
								</p>
							</div>
						</div>
						{#if selectedMedia.posts && selectedMedia.posts.length > 0}
							<ul class="mt-3 space-y-2 text-sm">
								{#each selectedMedia.posts as post}
									<li class="flex items-center justify-between rounded-md border px-3 py-2">
										<div class="space-y-1">
											<p class="font-medium text-foreground">{post.title}</p>
											<p class="text-xs text-muted-foreground uppercase tracking-wide">
												{post.usage_type}
											</p>
										</div>
										<a class="text-sm font-medium text-primary" href={`/admin/posts/${post.id}`}>
											View
										</a>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="mt-3 text-sm text-muted-foreground">This asset is not used in any posts.</p>
						{/if}
					</div>

					<div class="space-y-2 rounded-lg border bg-muted/40 p-4">
						<p class="text-sm font-semibold text-foreground">Delete image</p>
						<p class="text-sm text-muted-foreground">
							Deleting will remove the image from Cloudflare and D1. Items used by posts cannot be
							deleted.
						</p>
						{#if error}
							<p class="text-sm font-medium text-destructive">{error}</p>
						{/if}
						<div class="flex flex-wrap items-center gap-2">
							<Button
								variant="destructive"
								onclick={deleteImage}
								disabled={deleting || selectedMedia.usage_count > 0}
							>
								{deleting ? 'Deleting…' : 'Delete'}
							</Button>
							<Button variant="outline" onclick={closeDetails}>Close</Button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</DialogContent>
</Dialog>
