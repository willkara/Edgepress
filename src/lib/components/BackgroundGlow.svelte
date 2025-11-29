<script lang="ts">
	import { onMount } from 'svelte';

	let scrollY = $state(0);
	let ticking = false;

	function updateScroll() {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				scrollY = window.scrollY || 0;
				ticking = false;
			});
			ticking = true;
		}
	}

	onMount(() => {
		updateScroll();
		window.addEventListener('scroll', updateScroll, { passive: true });
		return () => window.removeEventListener('scroll', updateScroll);
	});
</script>

<div class="background-glow-container">
	<!-- Blob 1: Large, slow-moving, subtle -->
	<div
		class="glow-blob glow-blob-1 animate-slow-pulse"
		style={`--parallax-y: ${scrollY * 0.05}px; background: radial-gradient(circle at 75% 25%, var(--accent-strong), transparent 60%);`}
	></div>
	<!-- Blob 2: Medium, slightly faster, different position -->
	<div
		class="glow-blob glow-blob-2 animate-slow-pulse delay-500"
		style={`--parallax-y: ${scrollY * -0.035}px; background: radial-gradient(circle at 25% 75%, var(--accent), transparent 60%);`}
	></div>
	<!-- Blob 3: Smaller, faster, different color -->
	<div
		class="glow-blob glow-blob-3 animate-slow-pulse delay-1000"
		style={`--parallax-y: ${scrollY * 0.04}px; background: radial-gradient(circle at 50% 50%, var(--accent-soft), transparent 60%);`}
	></div>
</div>

<style>
	.background-glow-container {
		position: fixed;
		inset: 0;
		z-index: -10; /* Ensure it's behind all content */
		pointer-events: none; /* Do not interfere with mouse events */
		overflow: hidden; /* Prevent blobs from showing scrollbars */
	}

	.glow-blob {
		position: absolute;
		filter: blur(80px); /* Apply strong blur */
		opacity: 0.15; /* Subtle opacity */
		mix-blend-mode: screen; /* Lighten effect with dark background */
		--parallax-y: 0px;
	}

	.glow-blob-1 {
		width: 600px;
		height: 600px;
		top: -10%;
		left: -15%;
		animation: move-glow-1 20s infinite alternate ease-in-out;
	}

	.glow-blob-2 {
		width: 400px;
		height: 400px;
		bottom: -10%;
		right: -10%;
		animation: move-glow-2 18s infinite alternate ease-in-out;
	}

	.glow-blob-3 {
		width: 300px;
		height: 300px;
		top: 40%;
		right: 30%;
		animation: move-glow-3 22s infinite alternate ease-in-out;
	}

	@keyframes move-glow-1 {
		0% {
			transform: translate(0, 0) translateY(var(--parallax-y)) scale(1);
		}
		50% {
			transform: translate(20%, 30%) translateY(var(--parallax-y)) scale(1.1);
		}
		100% {
			transform: translate(0, 0) translateY(var(--parallax-y)) scale(1);
		}
	}

	@keyframes move-glow-2 {
		0% {
			transform: translate(0, 0) translateY(var(--parallax-y)) scale(1.1);
		}
		50% {
			transform: translate(-30%, -20%) translateY(var(--parallax-y)) scale(1);
		}
		100% {
			transform: translate(0, 0) translateY(var(--parallax-y)) scale(1.1);
		}
	}

	@keyframes move-glow-3 {
		0% {
			transform: translate(0, 0) translateY(var(--parallax-y)) scale(1);
		}
		50% {
			transform: translate(15%, -10%) translateY(var(--parallax-y)) scale(1.2);
		}
		100% {
			transform: translate(0, 0) translateY(var(--parallax-y)) scale(1);
		}
	}
</style>
