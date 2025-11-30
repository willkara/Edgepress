<script lang="ts">
	import { ArrowUp } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let showButton = $state(false);

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		function handleScroll() {
			showButton = window.scrollY > 400;
		}

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#if showButton}
        <button
                class="scroll-to-top"
                onclick={scrollToTop}
                aria-label="Scroll to top"
                title="Scroll to top"
        >
                <span class="icon" aria-hidden="true">
                        <ArrowUp />
                </span>
        </button>
{/if}

<style>
	.scroll-to-top {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent);
		color: #0f172a;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
		transition: all 200ms ease;
		z-index: 50;
		animation: fadeIn 200ms ease;
	}

	.scroll-to-top:hover {
		transform: translateY(-4px);
		box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.4);
	}

	.scroll-to-top:active {
		transform: translateY(-2px);
	}

	.scroll-to-top:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

        .icon {
                display: inline-flex;
                width: 1.25rem;
                height: 1.25rem;
        }

        .icon :global(svg) {
                width: 100%;
                height: 100%;
        }

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-to-top {
			animation: none;
			transition: none;
		}

		.scroll-to-top:hover {
			transform: none;
		}
	}

	@media (max-width: 768px) {
		.scroll-to-top {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 2.75rem;
			height: 2.75rem;
		}

                .icon {
                        width: 1.125rem;
                        height: 1.125rem;
                }
	}
</style>
