<script lang="ts">
	// Skeleton loader for text with customizable width
	let {
		width = '100%',
		height = '1rem',
		class: className = ''
	}: {
		width?: string;
		height?: string;
		class?: string;
	} = $props();
</script>

<div class="skeleton-text {className}" style="width: {width}; height: {height}"></div>

<style>
	.skeleton-text {
		background: linear-gradient(
			90deg,
			rgba(148, 163, 184, 0.1) 0%,
			rgba(148, 163, 184, 0.2) 50%,
			rgba(148, 163, 184, 0.1) 100%
		);
		background-size: 200% 100%;
		border-radius: 0.25rem;
		animation: shimmer 2s infinite;
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
		.skeleton-text {
			animation: none;
		}
	}
</style>
