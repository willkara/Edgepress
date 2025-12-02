<script lang="ts">
	import * as Progress from '$lib/components/ui/progress';
	import { onMount } from 'svelte';

	let {
		postSlug,
		wordCount = 0
	}: {
		postSlug?: string;
		wordCount?: number;
	} = $props();

	let scrollProgress = $state(0);
	let timeRemaining = $state('');
	let showTimeEstimate = $state(false);

	const READING_SPEED_WPM = 225; // Average reading speed

	function calculateTimeRemaining() {
		if (!wordCount) return '';

		const wordsRemaining = Math.ceil(wordCount * ((100 - scrollProgress) / 100));
		const minutesRemaining = Math.ceil(wordsRemaining / READING_SPEED_WPM);

		if (minutesRemaining < 1) return 'Less than 1 min';
		if (minutesRemaining === 1) return '1 min';
		return `${minutesRemaining} min`;
	}

	function updateScrollProgress() {
		const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
		const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

		// Calculate how much of the page has been scrolled
		const totalScrollableHeight = scrollHeight - clientHeight;

		if (totalScrollableHeight > 0) {
			scrollProgress = (scrollTop / totalScrollableHeight) * 100;
		} else {
			scrollProgress = 0; // Page is not scrollable (e.g., short content)
		}

		// Update time estimate
		timeRemaining = calculateTimeRemaining();

		// Show time estimate when user starts scrolling
		if (scrollProgress > 5 && !showTimeEstimate) {
			showTimeEstimate = true;
		}

		// Save progress to localStorage
		if (postSlug && scrollProgress > 10 && scrollProgress < 95) {
			try {
				localStorage.setItem(`reading-progress-${postSlug}`, scrollProgress.toString());
			} catch {
				// Ignore localStorage errors
			}
		}

		// Clear saved progress when near end
		if (postSlug && scrollProgress >= 95) {
			try {
				localStorage.removeItem(`reading-progress-${postSlug}`);
			} catch {
				// Ignore localStorage errors
			}
		}
	}

	onMount(() => {
		window.addEventListener('scroll', updateScrollProgress, { passive: true });
		// Initial update in case the page is already scrolled on load
		updateScrollProgress();

		return () => {
			window.removeEventListener('scroll', updateScrollProgress);
		};
	});
</script>

<div class="reading-progress-container">
	<Progress.Root value={scrollProgress} class="h-1 rounded-none" />

	{#if showTimeEstimate && timeRemaining && scrollProgress < 95}
		<div class="time-estimate">
			<span class="time-text">{timeRemaining} left</span>
		</div>
	{/if}
</div>

<style>
	.reading-progress-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
	}

	.time-estimate {
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 51;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 999px;
		padding: 0.5rem 1rem;
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		animation: slideIn 300ms ease;
	}

	.time-text {
		font-size: 0.8125rem;
		color: var(--text-muted);
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.time-estimate {
			top: 1rem;
			right: 1rem;
			padding: 0.375rem 0.875rem;
		}

		.time-text {
			font-size: 0.75rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.time-estimate {
			animation: none;
		}
	}
</style>
