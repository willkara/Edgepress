<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { ArrowLeft, Save } from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);

	let title = $state(data.project.title);
	let slug = $state(data.project.slug);

	// Only auto-update slug if it matches the generated version of the title
	// (i.e., user hasn't customized it)
	function generateSlug(t: string) {
		return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
	}

	$effect(() => {
		const generated = generateSlug(title);
		if (slug === generateSlug(data.project.title) && title !== data.project.title) {
			slug = generated;
		}
	});
</script>

<svelte:head>
	<title>Edit Project - Admin</title>
</svelte:head>

<div class="container mx-auto py-8 max-w-2xl">
	<div class="flex items-center gap-4 mb-8">
		<Button href="/admin/projects" variant="ghost" size="icon">
			<ArrowLeft class="w-4 h-4" />
		</Button>
		<h1 class="text-3xl font-bold">Edit Project</h1>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				update();
			};
		}}
		class="space-y-6"
	>
		{#if form?.error}
			<div class="bg-destructive/10 text-destructive px-4 py-3 rounded-md border border-destructive/20">
				{form.error}
			</div>
		{/if}

		<Card>
			<CardContent class="p-6 space-y-4">
				<div class="grid gap-2">
					<label for="title" class="text-sm font-medium">Title *</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={title}
						required
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>

				<div class="grid gap-2">
					<label for="slug" class="text-sm font-medium">Slug *</label>
					<input
						type="text"
						id="slug"
						name="slug"
						bind:value={slug}
						required
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>

				<div class="grid gap-2">
					<label for="description" class="text-sm font-medium">Description *</label>
					<textarea
						id="description"
						name="description"
						value={data.project.description}
						required
						rows="3"
						class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					></textarea>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="p-6 space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<label for="repo_url" class="text-sm font-medium">Repository URL</label>
						<input
							type="url"
							id="repo_url"
							name="repo_url"
							value={data.project.repo_url}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						/>
					</div>
					<div class="grid gap-2">
						<label for="demo_url" class="text-sm font-medium">Demo URL</label>
						<input
							type="url"
							id="demo_url"
							name="demo_url"
							value={data.project.demo_url}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						/>
					</div>
				</div>

				<div class="grid gap-2">
					<label for="tech_stack" class="text-sm font-medium">Tech Stack</label>
					<input
						type="text"
						id="tech_stack"
						name="tech_stack"
						value={data.project.tech_stack.join(', ')}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="Svelte, Cloudflare D1, Tailwind CSS"
					/>
					<p class="text-xs text-muted-foreground">Comma separated list of technologies</p>
				</div>

				<div class="grid gap-2">
					<label for="hero_image_id" class="text-sm font-medium">Hero Image ID</label>
					<input
						type="text"
						id="hero_image_id"
						name="hero_image_id"
						value={data.project.hero_image_id}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>

				<div class="flex items-center space-x-2">
					<input
						type="checkbox"
						id="is_featured"
						name="is_featured"
						checked={data.project.is_featured}
						class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
					/>
					<label for="is_featured" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Feature on homepage
					</label>
				</div>
			</CardContent>
		</Card>

		<div class="flex justify-end gap-4">
			<Button href="/admin/projects" variant="outline">Cancel</Button>
			<Button type="submit" disabled={loading}>
				{#if loading}
					Saving...
				{:else}
					<Save class="w-4 h-4 mr-2" />
					Save Changes
				{/if}
			</Button>
		</div>
	</form>
</div>
