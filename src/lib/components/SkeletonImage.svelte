<script lang="ts">
	// Skeleton loader for images
	let {
		width = '100%',
		height = '200px',
		class: className = ''
	}: {
		width?: string;
		height?: string;
		class?: string;
	} = $props();
</script>

<div class="skeleton-image {className}" style="width: {width}; height: {height}">
	<svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
		<circle cx="8.5" cy="8.5" r="1.5"/>
		<polyline points="21 15 16 10 5 21"/>
	</svg>
</div>

<style>
	.skeleton-image {
		background: linear-gradient(
			90deg,
			rgba(148, 163, 184, 0.08) 0%,
			rgba(148, 163, 184, 0.15) 50%,
			rgba(148, 163, 184, 0.08) 100%
		);
		background-size: 200% 100%;
		border-radius: 0.5rem;
		animation: shimmer 2s infinite;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.placeholder-icon {
		width: 3rem;
		height: 3rem;
		color: rgba(148, 163, 184, 0.3);
		opacity: 0.5;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton-image {
			animation: none;
		}
	}
</style>
