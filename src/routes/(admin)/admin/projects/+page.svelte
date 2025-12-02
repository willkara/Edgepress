<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { GripVertical, Plus, Star, Github, Globe, Trash2, Pencil } from 'lucide-svelte';
	import type { Project } from '$lib/server/db/projects';

	let { data } = $props();
	let projects = $state(data.projects);

	const flipDurationMs = 200;

	// Define DndEvent type locally since it's not exported by the package sometimes
	interface DndEvent<T> {
		items: T[];
	}

	function handleDndConsider(e: CustomEvent<DndEvent<Project>>) {
		projects = e.detail.items;
	}

	async function handleDndFinalize(e: CustomEvent<DndEvent<Project>>) {
		projects = e.detail.items;

		// Update display order in DB
		const updates = projects.map((p, index) => ({
			id: p.id,
			display_order: index
		}));

		try {
			const response = await fetch('/api/admin/projects/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates })
			});

			if (!response.ok) throw new Error('Failed to save order');
			toast.success('Order updated');
		} catch {
			toast.error('Failed to update order');
		}
	}

	async function deleteProject(id: string) {
		if (!confirm('Are you sure you want to delete this project?')) return;

		try {
			const response = await fetch(`/api/admin/projects/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) throw new Error('Failed to delete');

			projects = projects.filter((p) => p.id !== id);
			toast.success('Project deleted');
		} catch {
			toast.error('Failed to delete project');
		}
	}
</script>

<svelte:head>
	<title>Projects - Admin</title>
</svelte:head>

<div class="container mx-auto py-8 max-w-5xl">
	<div class="flex justify-between items-center mb-8">
		<div>
			<h1 class="text-3xl font-bold">Projects</h1>
			<p class="text-muted-foreground mt-1">Manage your portfolio items</p>
		</div>
		<Button href="/admin/projects/new">
			<Plus class="w-4 h-4 mr-2" />
			Add Project
		</Button>
	</div>

	{#if projects.length === 0}
		<Card class="border-dashed">
			<CardContent class="flex flex-col items-center justify-center py-12 text-center">
				<div class="rounded-full bg-muted p-4 mb-4">
					<Star class="w-8 h-8 text-muted-foreground" />
				</div>
				<h3 class="text-lg font-semibold mb-2">No projects yet</h3>
				<p class="text-muted-foreground max-w-sm mb-6">
					Create your first project to showcase your work in your portfolio.
				</p>
				<Button href="/admin/projects/new">Create Project</Button>
			</CardContent>
		</Card>
	{:else}
		<div
			use:dndzone={{ items: projects, flipDurationMs }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
			class="space-y-4"
		>
			{#each projects as project (project.id)}
				<div animate:flip={{ duration: flipDurationMs }}>
					<Card class="group hover:border-accent transition-colors">
						<CardContent class="p-4 flex items-center gap-4">
							<button class="cursor-grab text-muted-foreground hover:text-foreground">
								<GripVertical class="w-5 h-5" />
							</button>

							{#if project.hero_image_id}
								<img
									src="/cdn-cgi/imagedelivery/{data.imageHash}/{project.hero_image_id}/thumbnail"
									alt={project.title}
									class="w-16 h-12 object-cover rounded bg-muted"
								/>
							{:else}
								<div class="w-16 h-12 rounded bg-muted flex items-center justify-center">
									<Star class="w-5 h-5 text-muted-foreground" />
								</div>
							{/if}

							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<h3 class="font-medium truncate">{project.title}</h3>
									{#if project.is_featured}
										<span
											class="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
										>
											Featured
										</span>
									{/if}
								</div>
								<div class="flex items-center gap-3 text-xs text-muted-foreground">
									<span class="truncate max-w-[300px]">{project.description}</span>
									{#if project.repo_url}
										<span class="flex items-center gap-1">
											<Github class="w-3 h-3" /> Repo
										</span>
									{/if}
									{#if project.demo_url}
										<span class="flex items-center gap-1">
											<Globe class="w-3 h-3" /> Demo
										</span>
									{/if}
								</div>
							</div>

							<div
								class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<Button href="/admin/projects/{project.id}/edit" variant="ghost" size="icon">
									<Pencil class="w-4 h-4" />
								</Button>
								<Button
									onclick={() => deleteProject(project.id)}
									variant="ghost"
									size="icon"
									class="text-destructive hover:text-destructive hover:bg-destructive/10"
								>
									<Trash2 class="w-4 h-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			{/each}
		</div>
	{/if}
</div>
