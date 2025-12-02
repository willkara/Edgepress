<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div
	class="spotlight-card relative overflow-hidden rounded-lg transition-transform duration-150 ease-out"
>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	/* You might want to define accent-rgb in your app.css or as a Svelte var */
	/* For now, assuming --accent translates to something like 56, 189, 248 for RGB */
	/* If not, we'll need to update app.css */
</style>
