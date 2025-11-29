<script lang="ts">
	let {
		icon,
		label,
		value,
		color = 'primary'
	}: { icon: string; label: string; value: number | string; color?: string } = $props();
</script>

<div class="stats-card" data-color={color}>
	<div class="icon">{icon}</div>
	<div class="content">
		<div class="value">{value}</div>
		<div class="label">{label}</div>
	</div>
</div>

<style>
	.stats-card {
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1.25rem;
		transition: all 0.2s ease;
	}

	.stats-card:hover {
		border-color: var(--accent);
		box-shadow: var(--shadow-soft);
		transform: translateY(-2px);
	}

	.icon {
		font-size: 2.2rem;
		line-height: 1;
		opacity: 0.9;
		/* Optional: Wrap icon in a soft circle if desired, but keeping it simple for now */
	}

	.content {
		flex: 1;
	}

	.value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.label {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-top: 0.2rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
