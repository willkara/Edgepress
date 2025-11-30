<script lang="ts">
	import { page } from '$app/stores';
	import { Home, BookOpen, Folder, Search } from 'lucide-svelte';

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/blog', label: 'Blog', icon: BookOpen },
		{ href: '/projects', label: 'Projects', icon: Folder },
		{ href: '/search', label: 'Search', icon: Search }
	];

	$: currentPath = $page.url.pathname;
</script>

<nav class="mobile-bottom-nav" aria-label="Mobile navigation">
	{#each navItems as item}
		{@const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')}
                <a href={item.href} class="nav-item" class:active={isActive} aria-current={isActive ? 'page' : undefined}>
                        <span class="nav-icon" aria-hidden="true">
                                <item.icon />
                        </span>
                        <span class="nav-label">{item.label}</span>
                </a>
        {/each}
</nav>

<style>
	.mobile-bottom-nav {
		display: none;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: var(--bg-elevated);
		border-top: 1px solid var(--border-subtle);
		padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(12px);
		grid-template-columns: repeat(4, 1fr);
		gap: 0.25rem;
	}

	@media (max-width: 1023px) {
		.mobile-bottom-nav {
			display: grid;
		}
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.625rem 0.5rem;
		text-decoration: none;
		color: var(--text-subtle);
		transition: all 150ms;
		border-radius: 0.5rem;
		position: relative;
	}

	.nav-item:active {
		transform: scale(0.95);
	}

	.nav-item.active {
		color: var(--accent);
	}

	.nav-item.active::before {
		content: '';
		position: absolute;
		top: -0.5rem;
		left: 50%;
		transform: translateX(-50%);
		width: 2rem;
		height: 3px;
		background: linear-gradient(90deg, var(--accent-strong), var(--accent));
		border-radius: 0 0 4px 4px;
	}

        .nav-icon {
                display: inline-flex;
                width: 1.375rem;
                height: 1.375rem;
                flex-shrink: 0;
        }

        .nav-icon :global(svg) {
                width: 100%;
                height: 100%;
        }

	.nav-label {
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	/* Add bottom padding to body to account for fixed nav */
	:global(body) {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}

	@media (max-width: 1023px) {
		:global(body) {
			padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0));
		}
	}
</style>
