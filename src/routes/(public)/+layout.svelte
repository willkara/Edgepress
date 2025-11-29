<script lang="ts">
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
	const year = new Date().getFullYear();
</script>

<div class="site">
	<header class="site-header">
		<div class="site-header-inner">
			<a href="/" class="site-title" style="text-decoration: none; color: inherit;">EdgePress</a>
			<div style="display: flex; align-items: center; gap: 1.5rem;">
				                <nav class="site-nav">
				                    <a href="/">Home</a>
				                    <a href="/search">Search</a>
				                    <!-- <a href="/about">About</a> -->
				                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
				                </nav>				<UserMenu user={data.user} />
			</div>
		</div>
	</header>

	<main class="site-main">
		{@render children()}
	</main>

	<footer class="site-footer">
		&copy; {year} EdgePress • Built for the edge
	</footer>
</div>
