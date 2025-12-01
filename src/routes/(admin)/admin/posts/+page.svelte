<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectItem,
		SelectLabel,
		SelectTrigger
	} from '$lib/components/ui/select';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import UploadIcon from '@lucide/svelte/icons/upload';

	let { data }: { data: PageData } = $props();

	let searchInput = $state(data.filters.search);
	let statusFilter = $state(data.filters.status);
	let deleting = $state<string | null>(null);

	// Applies the current filters and resets pagination to the first page.
	function applyFilters() {
		const params = new URLSearchParams();
		if (searchInput) params.set('search', searchInput);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		params.set('page', '1');
		goto(`/admin/posts?${params.toString()}`);
	}

	// Clears all filters and returns to the initial listing state.
	function resetFilters() {
		searchInput = '';
		statusFilter = 'all';
		applyFilters();
	}

	// Navigates to a specific page while preserving active filters.
	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`/admin/posts?${params.toString()}`);
	}

	// Deletes a post after confirmation and refreshes the listing.
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

	// Toggles publish/unpublish state for a post and refreshes the listing.
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

	// Formats a date string for concise table display.
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

<div class="space-y-8">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Posts</h1>
			<p class="text-sm text-muted-foreground">
				Review, filter, and publish content created in the editor.
			</p>
		</div>
		<Button href="/admin/posts/new" size="sm" class="ml-auto">
			<UploadIcon class="size-4" />
			Create post
		</Button>
	</div>

	<div class="rounded-lg border bg-card p-4 shadow-sm">
		<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
			<div class="space-y-2">
				<div class="flex items-center justify-between gap-2">
					<label for="search-input" class="text-sm font-medium text-foreground/90">Search</label>
					<Button variant="ghost" size="sm" class="h-8" onclick={resetFilters}>Reset</Button>
				</div>
				<div class="flex flex-col gap-2 sm:flex-row">
					<Input
						id="search-input"
						placeholder="Search by title or author"
						bind:value={searchInput}
						onkeydown={(event) => event.key === 'Enter' && applyFilters()}
					/>
					<Button variant="outline" class="sm:w-28" onclick={applyFilters}>Apply</Button>
				</div>
			</div>

			<label class="space-y-2 text-sm font-medium text-foreground/90">
				<span>Status</span>
				<Select bind:value={statusFilter} type="single">
					<SelectTrigger class="w-full justify-between">
						<span class="text-sm text-foreground">
							{statusFilter === 'all'
								? 'All statuses'
								: statusFilter === 'published'
									? 'Published'
									: 'Draft'}
						</span>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Visibility</SelectLabel>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="published">Published</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</label>
		</div>
		<Separator class="my-4" />
		<p class="text-sm text-muted-foreground">
			{data.total} post{data.total !== 1 ? 's' : ''} found
		</p>
	</div>

	{#if data.posts.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/40 p-10 text-center"
		>
			<p class="text-sm text-muted-foreground">No posts match the current filters.</p>
			<div class="flex gap-2">
				<Button href="/admin/posts/new" size="sm">
					<PencilIcon class="size-4" />
					Create your first post
				</Button>
				<Button variant="outline" size="sm" onclick={resetFilters}>Clear filters</Button>
			</div>
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg border bg-card shadow-sm">
			<div class="overflow-x-auto">
				<Table class="min-w-full">
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Author</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Published</TableHead>
							<TableHead>Updated</TableHead>
							<TableHead class="w-[160px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.posts as post}
							<TableRow class="align-top">
								<TableCell class="max-w-[320px]">
									<div class="space-y-1">
										<a
											href={`/admin/posts/${post.id}/edit`}
											class="line-clamp-2 font-medium text-foreground transition hover:text-primary"
										>
											{post.title}
										</a>
										<p class="text-xs text-muted-foreground">{post.category_name || '—'}</p>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
										{post.status}
									</Badge>
								</TableCell>
								<TableCell class="whitespace-nowrap text-sm text-muted-foreground">
									{post.author_name}
								</TableCell>
								<TableCell class="whitespace-nowrap text-sm text-muted-foreground">
									{post.category_name || 'Uncategorized'}
								</TableCell>
								<TableCell class="whitespace-nowrap text-sm text-muted-foreground">
									{formatDate(post.published_at)}
								</TableCell>
								<TableCell class="whitespace-nowrap text-sm text-muted-foreground">
									{formatDate(post.updated_at)}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex justify-end gap-2">
										<Button
											href={`/admin/posts/${post.id}/edit`}
											variant="ghost"
											size="icon-sm"
											title="Edit post"
										>
											<PencilIcon class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											title={post.status === 'published' ? 'Unpublish' : 'Publish'}
											onclick={() => togglePublish(post.id, post.status)}
										>
											{post.status === 'published' ? 'Unpublish' : 'Publish'}
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											class="text-destructive hover:text-destructive"
											title="Delete"
											disabled={deleting === post.id}
											onclick={() => deletePost(post.id, post.title)}
										>
											{#if deleting === post.id}
												…
											{:else}
												<TrashIcon class="size-4" />
											{/if}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		</div>

		{#if data.totalPages > 1}
			<div
				class="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm"
			>
				<p class="text-sm text-muted-foreground">
					Page {data.currentPage} of {data.totalPages}
				</p>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						class="min-w-[96px]"
						disabled={data.currentPage === 1}
						onclick={() => goToPage(data.currentPage - 1)}
					>
						<ArrowLeftIcon class="size-4" />
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="min-w-[96px]"
						disabled={data.currentPage === data.totalPages}
						onclick={() => goToPage(data.currentPage + 1)}
					>
						Next
						<ArrowRightIcon class="size-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
