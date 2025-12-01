<script lang="ts">
	// Skip to main content link for accessibility
	// Allows keyboard users to skip navigation and jump directly to main content
</script>

<a href="#main-content" class="skip-link"> Skip to main content </a>

<style>
	.skip-link {
		position: absolute;
		top: -100px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10000;
		padding: 0.75rem 1.5rem;
		background: var(--accent);
		color: #0f172a;
		text-decoration: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.95rem;
		box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
		transition: top 150ms;
	}

	.skip-link:focus {
		top: 1rem;
	}
</style>
