<script lang="ts">
	import { Mail, CheckCircle, AlertCircle } from 'lucide-svelte';

	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let message = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email || !email.includes('@')) {
			status = 'error';
			message = 'Please enter a valid email address';
			return;
		}

		status = 'loading';

		try {
			// TODO: Replace with actual API endpoint
			const response = await fetch('/api/newsletter/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			if (response.ok) {
				status = 'success';
				message = 'Thanks for subscribing! Check your email to confirm.';
				email = '';
			} else {
				const data = await response.json();
				status = 'error';
				message = data.error || 'Something went wrong. Please try again.';
			}
		} catch (error) {
			status = 'error';
			message = 'Network error. Please try again.';
		}
	}
</script>

<aside class="newsletter-signup">
	<div class="newsletter-header">
		<div class="newsletter-icon">
			<Mail class="w-6 h-6" />
		</div>
		<div>
			<h3 class="newsletter-title">Subscribe to the Newsletter</h3>
			<p class="newsletter-subtitle">
				Get the latest posts delivered right to your inbox
			</p>
		</div>
	</div>

	<form onsubmit={handleSubmit} class="newsletter-form">
		<div class="input-wrapper">
			<input
				type="email"
				bind:value={email}
				placeholder="your@email.com"
				required
				disabled={status === 'loading' || status === 'success'}
				class="email-input"
				aria-label="Email address"
			/>
			<button
				type="submit"
				disabled={status === 'loading' || status === 'success'}
				class="subscribe-button"
			>
				{#if status === 'loading'}
					<span class="loading-spinner"></span>
					Subscribing...
				{:else if status === 'success'}
					<CheckCircle class="w-4 h-4" />
					Subscribed
				{:else}
					Subscribe
				{/if}
			</button>
		</div>

		{#if message}
			<div class="message" class:success={status === 'success'} class:error={status === 'error'}>
                                {#if status === 'success'}
                                        <span class="message-icon" aria-hidden="true">
                                                <CheckCircle />
                                        </span>
                                {:else if status === 'error'}
                                        <span class="message-icon" aria-hidden="true">
                                                <AlertCircle />
                                        </span>
                                {/if}
				<span>{message}</span>
			</div>
		{/if}
	</form>

	<p class="newsletter-privacy">
		We respect your privacy. Unsubscribe at any time.
	</p>
</aside>

<style>
	.newsletter-signup {
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		padding: 2rem;
		margin: 3rem 0;
	}

	.newsletter-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.newsletter-icon {
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.75rem;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.newsletter-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 0.25rem;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.newsletter-subtitle {
		font-size: 0.95rem;
		color: var(--text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.newsletter-form {
		margin-bottom: 0.75rem;
	}

	.input-wrapper {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.email-input {
		flex: 1;
		padding: 0.75rem 1rem;
		background: var(--bg-soft);
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		color: var(--text-main);
		font-size: 0.95rem;
		transition: all 150ms;
	}

	.email-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
	}

	.email-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.email-input::placeholder {
		color: var(--text-subtle);
	}

	.subscribe-button {
		padding: 0.75rem 1.5rem;
		background: var(--accent);
		color: #0f172a;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
	}

	.subscribe-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
	}

	.subscribe-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.loading-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(15, 23, 42, 0.3);
		border-top-color: #0f172a;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.message.success {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		color: rgb(74, 222, 128);
	}

	.message.error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: rgb(248, 113, 113);
	}

        .message-icon {
                display: inline-flex;
                width: 1.125rem;
                height: 1.125rem;
                flex-shrink: 0;
        }

        .message-icon :global(svg) {
                width: 100%;
                height: 100%;
        }

	.newsletter-privacy {
		font-size: 0.8125rem;
		color: var(--text-subtle);
		margin: 0;
		text-align: center;
	}

	@media (max-width: 640px) {
		.newsletter-signup {
			padding: 1.5rem;
		}

		.input-wrapper {
			flex-direction: column;
		}

		.subscribe-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
