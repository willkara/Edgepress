<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { RefreshCw } from 'lucide-svelte';

	let pullDistance = $state(0);
	let isRefreshing = $state(false);
	let canPull = $state(false);

	const PULL_THRESHOLD = 80; // Distance in pixels to trigger refresh
	const MAX_PULL = 120; // Maximum pull distance

	let startY = 0;
	let touchStarted = false;

	function handleTouchStart(e: TouchEvent) {
		// Only allow pull-to-refresh if page is scrolled to top
		if (window.scrollY === 0 && !isRefreshing) {
			startY = e.touches[0].clientY;
			touchStarted = true;
			canPull = true;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (!touchStarted || !canPull || isRefreshing) return;

		const currentY = e.touches[0].clientY;
		const distance = currentY - startY;

		// Only track downward pulls from the top
		if (distance > 0) {
			// Prevent default scroll behavior when pulling
			if (distance > 10) {
				e.preventDefault();
			}

			// Apply resistance as pull distance increases
			const resistance = 2;
			pullDistance = Math.min(distance / resistance, MAX_PULL);
		} else {
			// Reset if user scrolls up
			canPull = false;
			pullDistance = 0;
		}
	}

	async function handleTouchEnd() {
		if (!touchStarted) return;

		touchStarted = false;

		// Trigger refresh if pulled beyond threshold
		if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
			isRefreshing = true;

			try {
				// Invalidate all data to trigger reload
				await invalidateAll();

				// Minimum display time for refresh indicator
				await new Promise((resolve) => setTimeout(resolve, 800));
			} catch (error) {
				console.error('Failed to refresh:', error);
			} finally {
				isRefreshing = false;
				pullDistance = 0;
				canPull = false;
			}
		} else {
			// Reset without refreshing
			pullDistance = 0;
			canPull = false;
		}
	}

	onMount(() => {
		// Only enable on touch devices
		const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		if (isTouchDevice) {
			document.addEventListener('touchstart', handleTouchStart, { passive: true });
			document.addEventListener('touchmove', handleTouchMove, { passive: false });
			document.addEventListener('touchend', handleTouchEnd);

			return () => {
				document.removeEventListener('touchstart', handleTouchStart);
				document.removeEventListener('touchmove', handleTouchMove);
				document.removeEventListener('touchend', handleTouchEnd);
			};
		}
	});
</script>

{#if pullDistance > 0 || isRefreshing}
	<div
		class="pull-to-refresh-indicator"
		style="transform: translateY({pullDistance}px); opacity: {Math.min(
			pullDistance / PULL_THRESHOLD,
			1
		)}"
	>
		<div class="refresh-icon" class:spinning={isRefreshing}>
			<RefreshCw class="w-5 h-5" />
		</div>
		<span class="refresh-text">
			{#if isRefreshing}
				Refreshing...
			{:else if pullDistance >= PULL_THRESHOLD}
				Release to refresh
			{:else}
				Pull to refresh
			{/if}
		</span>
	</div>
{/if}

<style>
	.pull-to-refresh-indicator {
		position: fixed;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0 0 0.75rem 0.75rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(12px);
		transition: opacity 200ms ease;
		pointer-events: none;
	}

	.refresh-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: var(--accent-soft);
		color: var(--accent);
		transition: transform 300ms ease;
	}

	.refresh-icon.spinning {
		animation: spin 1s linear infinite;
	}

	.refresh-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-muted);
		white-space: nowrap;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.refresh-icon.spinning {
			animation: none;
		}

		.pull-to-refresh-indicator {
			transition: none;
		}
	}

	/* Only show on mobile/tablet devices */
	@media (min-width: 1024px) {
		.pull-to-refresh-indicator {
			display: none;
		}
	}
</style>
