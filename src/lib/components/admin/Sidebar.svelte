<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: '📊' },
		{ href: '/admin/posts', label: 'Posts', icon: '📝' },
		{ href: '/admin/projects', label: 'Projects Page', icon: '🚀' },
		{ href: '/admin/media', label: 'Media', icon: '🖼️' },
		{ href: '/admin/categories', label: 'Categories', icon: '📂' },
		{ href: '/admin/tags', label: 'Tags', icon: '🏷️' },
		{ href: '/admin/injections', label: 'Injections', icon: '💉' },
		{ href: '/admin/settings', label: 'Settings', icon: '⚙️' }
	];

	function isActive(href: string): boolean {
		if (href === '/admin') {
			return $page.url.pathname === '/admin';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

<aside class="sidebar">
	<div class="logo">
		<h2 class="logo-text">EdgePress</h2>
		<span class="logo-badge">Admin</span>
	</div>

	<nav class="nav">
		{#each navItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={isActive(item.href)}
				aria-current={isActive(item.href) ? 'page' : undefined}
			>
				<span class="icon">{item.icon}</span>
				<span class="label">{item.label}</span>
			</a>
		{/each}
	</nav>
</aside>

<style>
	.sidebar {
		width: 240px;
		height: 100vh;
		background: var(--bg-elevated);
		border-right: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 20;
	}

	.logo {
		padding: 1.5rem 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo-text {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0;
		letter-spacing: -0.02em;
	}

	.logo-badge {
		font-size: 0.7rem;
		text-transform: uppercase;
		background: var(--bg-soft);
		color: var(--text-muted);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		letter-spacing: 0.05em;
		border: 1px solid var(--border-subtle);
	}

	.nav {
		flex: 1;
		padding: 1.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: all 0.15s;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.03);
		color: var(--text-main);
	}

	.nav-item.active {
		background: var(--accent-soft);
		color: var(--accent);
		border: 1px solid rgba(56, 189, 248, 0.2); /* subtle accent border */
	}

	.icon {
		font-size: 1.1rem;
		line-height: 1;
		opacity: 0.8;
	}

	.label {
		line-height: 1;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.sidebar {
			width: 64px;
		}

		.logo {
			padding: 1.5rem 0;
			justify-content: center;
		}

		.logo-text {
			display: none;
		}

		.logo-badge {
			display: none;
		}

		.nav-item {
			padding: 0.75rem;
			justify-content: center;
		}

		.nav-item .label {
			display: none;
		}
	}
</style>
