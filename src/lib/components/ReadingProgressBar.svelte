<script lang="ts">
	import * as Progress from '$lib/components/ui/progress';
	import { onMount } from 'svelte';

	let scrollProgress = $state(0);

	function updateScrollProgress() {
		const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
		const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

		// Calculate how much of the page has been scrolled
		const totalScrollableHeight = scrollHeight - clientHeight;

		if (totalScrollableHeight > 0) {
			scrollProgress = (scrollTop / totalScrollableHeight) * 100;
		} else {
			scrollProgress = 0; // Page is not scrollable (e.g., short content)
		}
	}

	onMount(() => {
		window.addEventListener('scroll', updateScrollProgress, { passive: true });
		// Initial update in case the page is already scrolled on load
		updateScrollProgress();

		return () => {
			window.removeEventListener('scroll', updateScrollProgress);
		};
	});
</script>

<div class="fixed top-0 left-0 right-0 z-50">
	<Progress.Root value={scrollProgress} class="h-1 rounded-none" />
</div>
