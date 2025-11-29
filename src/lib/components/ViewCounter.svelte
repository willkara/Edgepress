<script lang="ts">
	import { onMount } from 'svelte';
	import { Eye } from '@lucide/svelte';

	let { initialViews, slug }: { initialViews: number; slug: string } = $props();

let views = $state(initialViews);
// Keep a local flag to avoid double-counting in this session; not used in template
let _hasViewed = false;

	onMount(async () => {
		// Simple session storage check to prevent double counting on refresh
		const storageKey = `viewed_${slug}`;
		if (sessionStorage.getItem(storageKey)) {
			_hasViewed = true;
			return;
		}

		try {
			const response = await fetch('/api/analytics/view', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug })
			});

			if (response.ok) {
				const data = await response.json();
				views = data.views;
				sessionStorage.setItem(storageKey, 'true');
				_hasViewed = true;
			}
		} catch (error) {
			console.error('Failed to increment views:', error);
		}
	});
</script>

<div class="flex items-center gap-1.5 text-sm text-muted-foreground" title="{views} views">
	<Eye class="h-4 w-4" />
	<span>{new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(views)}</span>
</div>
