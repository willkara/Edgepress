<script lang="ts">
	let { error, status }: { error: Error; status: number } = $props();

	const is404 = status === 404;
	const headline = is404 ? 'Lost in the edge wind' : 'Something went sideways';
	const detail = is404
		? "We couldn't find that page. It might have been moved, unpublished, or never existed."
		: 'An unexpected error occurred. Please try again or head back to safety.';
</script>

<svelte:head>
	<title>{is404 ? 'Page not found' : 'Error'} - EdgePress</title>
</svelte:head>

<section class="error-page">
	<div class="card">
		<div class="badge">{status}</div>
		<h1>{headline}</h1>
		<p class="muted">{detail}</p>

		{#if !is404}
			<p class="muted small">
				<code>{error?.message ?? 'Unknown error'}</code>
			</p>
		{/if}

		<div class="actions">
			<a class="btn primary" href="/">Back to home</a>
			<button class="btn ghost" type="button" onclick={() => history.back()}> Go back </button>
		</div>

		<pre class="art">
   .----.
  /      \\
 | 404 X |
  \\      /
   '----'
		</pre>
	</div>
</section>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
		background:
			radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.12), transparent 30%),
			radial-gradient(circle at 80% 10%, hsl(var(--accent) / 0.12), transparent 28%),
			hsl(var(--background));
	}

	.card {
		width: min(720px, 100%);
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.85rem;
		padding: 2rem;
		box-shadow: 0 16px 50px hsl(var(--foreground) / 0.08);
		display: grid;
		gap: 0.75rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 0.75rem;
		background: hsl(var(--primary) / 0.12);
		color: hsl(var(--primary));
		font-weight: 800;
		font-size: 1.1rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(1.75rem, 4vw, 2.6rem);
	}

	.muted {
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.small {
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.65rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border));
		cursor: pointer;
		text-decoration: none;
		font-weight: 600;
		color: hsl(var(--foreground));
		background: hsl(var(--background));
		transition:
			transform 120ms ease,
			box-shadow 120ms ease,
			border-color 120ms ease;
	}

	.btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 18px hsl(var(--foreground) / 0.08);
		border-color: hsl(var(--primary) / 0.4);
	}

	.btn.primary {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-color: hsl(var(--primary));
	}

	.btn.ghost {
		background: transparent;
	}

	.art {
		margin: 0.5rem 0 0;
		padding: 1rem;
		background: hsl(var(--muted));
		border-radius: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		color: hsl(var(--foreground));
	}
</style>
