<script lang="ts">
	// Skeleton loader for post card with shimmer animation
	let { class: className = '' }: { class?: string } = $props();
</script>

<div class="skeleton-card {className}">
	<div class="skeleton-meta"></div>
	<div class="skeleton-title"></div>
	<div class="skeleton-title short"></div>
	<div class="skeleton-excerpt"></div>
	<div class="skeleton-excerpt"></div>
	<div class="skeleton-excerpt short"></div>
</div>

<style>
	.skeleton-card {
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		padding: 1.2rem 1.4rem;
		margin-bottom: 1rem;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.skeleton-meta,
	.skeleton-title,
	.skeleton-excerpt {
		height: 1rem;
		background: linear-gradient(
			90deg,
			rgba(148, 163, 184, 0.1) 0%,
			rgba(148, 163, 184, 0.2) 50%,
			rgba(148, 163, 184, 0.1) 100%
		);
		background-size: 200% 100%;
		border-radius: 0.25rem;
		animation: shimmer 2s infinite;
		margin-bottom: 0.75rem;
	}

	.skeleton-meta {
		width: 40%;
		height: 0.75rem;
	}

	.skeleton-title {
		height: 1.25rem;
		width: 85%;
	}

	.skeleton-title.short {
		width: 60%;
	}

	.skeleton-excerpt {
		height: 0.875rem;
		width: 100%;
	}

	.skeleton-excerpt.short {
		width: 75%;
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
		.skeleton-card,
		.skeleton-meta,
		.skeleton-title,
		.skeleton-excerpt {
			animation: none;
		}
	}
</style>
