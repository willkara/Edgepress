<script lang="ts">
	import { page } from '$app/stores';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { PublicUser } from '$lib/server/auth/types';
	import { Home, Search, Github, BookOpen } from 'lucide-svelte';

	let { user }: { user: PublicUser | undefined } = $props();

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/search', label: 'Search', icon: Search },
		{ href: 'https://github.com', label: 'GitHub', icon: Github, external: true }
	];

	function isActive(href: string): boolean {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}

    const year = new Date().getFullYear();
</script>

<aside class="sidebar h-full flex flex-col bg-[#050816] border-r border-white/10 text-white">
	<!-- Top: Site Identity / Author Info -->
	<div class="p-6 border-b border-white/10">
		<a href="/" class="block mb-4">
			<h1 class="text-xl font-bold tracking-tight text-white font-space">EdgePress</h1>
		</a>
		<div class="flex items-center gap-3">
			<div class="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-accent/30">
                <!-- Placeholder for Author Image -->
				<span class="text-accent text-lg">EP</span>
			</div>
			<div>
				<p class="text-sm font-medium leading-none text-white">The Author</p>
				<p class="text-xs text-gray-400 mt-1">Tech & Thoughts</p>
			</div>
		</div>
	</div>

	<!-- Middle: Navigation -->
	<nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <div class="px-2 pb-2">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</p>
        </div>
		{#each navItems as item}
			<a
				href={item.href}
				target={item.external ? '_blank' : undefined}
				rel={item.external ? 'noopener noreferrer' : undefined}
				class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                {isActive(item.href)
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}"
			>
				<item.icon class="h-4 w-4" />
				{item.label}
			</a>
		{/each}
	</nav>

	<!-- Bottom: User Menu & Footer -->
	<div class="p-4 border-t border-border bg-muted/20">
		<div class="flex items-center justify-between gap-2 mb-4">
            <div class="flex flex-col">
                <span class="text-xs font-medium text-white">Account</span>
                <span class="text-[10px] text-gray-400">{user ? 'Manage profile' : 'Login to interact'}</span>
            </div>
			<UserMenu {user} />
		</div>

        <div class="text-center">
            <p class="text-[10px] text-muted-foreground">
                &copy; {year} EdgePress
            </p>
        </div>
	</div>
</aside>

<style>
    .font-space {
        font-family: 'Space Grotesk', system-ui, sans-serif;
    }
</style>
