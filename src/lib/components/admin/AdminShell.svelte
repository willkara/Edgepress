<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import type { PublicUser } from '$lib/server/auth/types';

	let { user, children }: { user: PublicUser; children: any } = $props();

	async function handleLogout() {
		const response = await fetch('/api/auth/logout', { method: 'POST' });
		if (response.ok) {
			window.location.href = '/login';
		}
	}
</script>

<div class="admin-shell">
	<Sidebar />

	<div class="main-container">
		<header class="header">
			<div class="header-left">
				<!-- Page title logic can be improved, but currently relying on child pages -->
			</div>

			<div class="header-right">
				<div class="user-info">
					<span class="user-name">{user.display_name || user.email}</span>
					<button class="logout-btn" onclick={handleLogout}> Logout </button>
				</div>
			</div>
		</header>

		<main class="content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.admin-shell {
		display: flex;
		min-height: 100vh;
		background: var(--bg-page); /* Use the global page background */
	}

	.main-container {
		margin-left: 240px;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0; /* Prevent flex overflow */
	}

	.header {
		height: 64px;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 2rem;
		background: rgba(2, 6, 23, 0.8); /* Semi-transparent dark */
		backdrop-filter: blur(12px);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.header-left {
		flex: 1;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-name {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.logout-btn {
		padding: 0.4rem 0.9rem;
		border-radius: 0.375rem;
		border: 1px solid var(--border-subtle);
		background: rgba(15, 23, 42, 0.5);
		color: var(--text-main);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.logout-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.main-container {
			margin-left: 64px;
		}

		.header {
			padding: 0 1rem;
		}

		.user-name {
			display: none;
		}

		.content {
			padding: 1.5rem;
		}
	}
</style>
