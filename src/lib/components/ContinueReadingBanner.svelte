<script lang="ts">
	import { onMount } from 'svelte';
	import { BookOpen, X } from 'lucide-svelte';

	let { postSlug }: { postSlug: string } = $props();

	let savedProgress = $state<number | null>(null);
	let showBanner = $state(false);

	function scrollToSavedPosition() {
		if (!savedProgress) return;

		const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
		const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
		const totalScrollableHeight = scrollHeight - clientHeight;
		const scrollTo = (savedProgress / 100) * totalScrollableHeight;

		window.scrollTo({
			top: scrollTo,
			behavior: 'smooth'
		});

		dismissBanner();
	}

	function dismissBanner() {
		showBanner = false;
		// Clear saved progress on dismiss
		try {
			localStorage.removeItem(`reading-progress-${postSlug}`);
		} catch (e) {
			// Ignore localStorage errors
		}
	}

	onMount(() => {
		try {
			const saved = localStorage.getItem(`reading-progress-${postSlug}`);
			if (saved) {
				const progress = parseFloat(saved);
				// Only show if meaningful progress (10-90%)
				if (progress >= 10 && progress <= 90) {
					savedProgress = progress;
					showBanner = true;
				}
			}
		} catch (e) {
			// Ignore localStorage errors
		}
	});
</script>

{#if showBanner && savedProgress}
	<div class="continue-reading-banner">
		<div class="banner-content">
			<BookOpen class="banner-icon" />
			<div class="banner-text">
				<strong>Continue reading</strong>
				<span>You're {Math.round(savedProgress)}% through this article</span>
			</div>
		</div>
		<div class="banner-actions">
			<button class="resume-button" onclick={scrollToSavedPosition}>
				Resume
			</button>
			<button class="dismiss-button" onclick={dismissBanner} aria-label="Dismiss">
				<X class="w-4 h-4" />
			</button>
		</div>
	</div>
{/if}

<style>
	.continue-reading-banner {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
		padding: 1rem 1.25rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(12px);
		display: flex;
		align-items: center;
		gap: 1.5rem;
		max-width: 90vw;
		animation: slideUp 300ms ease;
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.banner-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: var(--accent);
		flex-shrink: 0;
	}

	.banner-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.banner-text strong {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-main);
	}

	.banner-text span {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.banner-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.resume-button {
		padding: 0.5rem 1.25rem;
		background: var(--accent);
		color: #0f172a;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms;
	}

	.resume-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
	}

	.dismiss-button {
		padding: 0.5rem;
		background: transparent;
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		color: var(--text-subtle);
		cursor: pointer;
		transition: all 150ms;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dismiss-button:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	@media (max-width: 768px) {
		.continue-reading-banner {
			bottom: 6rem; /* Account for mobile bottom nav */
			padding: 0.875rem 1rem;
			gap: 1rem;
			flex-direction: column;
			align-items: stretch;
		}

		.banner-content {
			gap: 0.75rem;
		}

		.banner-icon {
			width: 1.25rem;
			height: 1.25rem;
		}

		.banner-actions {
			width: 100%;
		}

		.resume-button {
			flex: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.continue-reading-banner {
			animation: none;
		}
	}
</style>
