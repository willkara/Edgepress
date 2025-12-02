<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect to dashboard
				goto('/admin');
			} else {
				error = data.error || 'Login failed';
			}
		} catch {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-page">
	<div class="login-card">
		<div class="logo">
			<h1>EdgePress</h1>
			<p class="subtitle">Admin Panel</p>
		</div>

		<form onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="admin@edgepress.local"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					required
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="error-message">
					{error}
				</div>
			{/if}

			<button type="submit" class="login-button" disabled={loading}>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>

		<div class="footer">
			<p class="text-sm text-muted">Demo credentials: admin@edgepress.local / changeme123</p>
		</div>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Background handled by body global style, but ensure transparent here */
		background: transparent;
		padding: 1rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 1rem;
		padding: 2.5rem 2rem;
		box-shadow: var(--shadow-soft);
	}

	.logo {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.logo h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: 0.5rem;
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-main);
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		background: var(--bg-page);
		color: var(--text-main);
		font-size: 0.95rem;
		transition: all 0.15s;
	}

	input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}

	input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error-message {
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		color: #fca5a5;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.login-button {
		width: 100%;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(to right, var(--accent-strong), var(--accent));
		color: #0f172a; /* Dark text on bright button */
		border: none;
		border-radius: 999px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}

	.login-button:hover:not(:disabled) {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	.login-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.footer {
		margin-top: 2rem;
		text-align: center;
	}

	.text-muted {
		color: var(--text-subtle);
	}
</style>
