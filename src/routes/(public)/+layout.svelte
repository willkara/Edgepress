<script lang="ts">
	import PublicSidebar from '$lib/components/PublicSidebar.svelte';
	import MobilePublicNav from '$lib/components/MobilePublicNav.svelte';
	import AnimatedOrbs from '$lib/components/AnimatedOrbs.svelte';
	import PageTransition from '$lib/components/PageTransition.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<AnimatedOrbs />
<PageTransition />
<ScrollToTop />

<div class="min-h-screen flex flex-col lg:flex-row">
	<!-- Mobile Header (visible only on small screens) -->
	<MobilePublicNav user={data.user} />

	<!-- Desktop Sidebar (hidden on small screens, fixed on large) -->
	<div class="hidden lg:block w-[260px] shrink-0 h-screen sticky top-0">
		<PublicSidebar user={data.user} />
	</div>

	<!-- Main Content Area -->
	<main class="flex-1 min-w-0">
		<div class="container max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-10">
			{@render children()}
		</div>
	</main>
</div>
