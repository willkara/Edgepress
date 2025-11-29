<script lang="ts">
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';

	// Track navigation state for smooth transitions
	let isNavigating = $state(false);

	$effect(() => {
		isNavigating = !!$navigating;
	});
</script>

{#if isNavigating}
	<div class="page-transition-overlay" transition:fade={{ duration: 150 }}></div>
{/if}

<style>
	.page-transition-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(5, 8, 22, 0.3);
		backdrop-filter: blur(2px);
		z-index: 9999;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.page-transition-overlay {
			display: none;
		}
	}
</style>
