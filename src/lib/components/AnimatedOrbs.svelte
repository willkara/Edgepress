<script lang="ts">
	// Animated background orbs for visual interest
	// Creates floating gradient spheres that move slowly across the screen
</script>

<div class="orbs-container" aria-hidden="true">
	<div class="orb orb-1"></div>
	<div class="orb orb-2"></div>
	<div class="orb orb-3"></div>
</div>

<style>
	.orbs-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		pointer-events: none;
		z-index: -1;
	}

	.orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.15;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		animation-direction: alternate;
	}

	.orb-1 {
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0) 70%);
		top: -10%;
		right: -10%;
		animation: float-1 20s infinite;
	}

	.orb-2 {
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0) 70%);
		bottom: -5%;
		left: -5%;
		animation: float-2 25s infinite;
	}

	.orb-3 {
		width: 350px;
		height: 350px;
		background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0) 70%);
		top: 40%;
		left: 50%;
		transform: translateX(-50%);
		animation: float-3 30s infinite;
	}

	@keyframes float-1 {
		0% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(-50px, 50px) scale(1.1);
		}
		100% {
			transform: translate(0, 0) scale(1);
		}
	}

	@keyframes float-2 {
		0% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(60px, -40px) scale(1.15);
		}
		100% {
			transform: translate(0, 0) scale(1);
		}
	}

	@keyframes float-3 {
		0% {
			transform: translateX(-50%) translate(0, 0) scale(1);
		}
		50% {
			transform: translateX(-50%) translate(30px, 60px) scale(0.9);
		}
		100% {
			transform: translateX(-50%) translate(0, 0) scale(1);
		}
	}

	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.orb {
			animation: none;
			opacity: 0.08;
		}
	}

	/* Hide on mobile for performance */
	@media (max-width: 768px) {
		.orbs-container {
			display: none;
		}
	}
</style>
