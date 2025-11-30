<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();

	let mouseX = $state(0);
	let mouseY = $state(0);
	let rect: DOMRect;
	let isHovering = $state(false);

	function handleMouseMove(event: MouseEvent) {
		if (!rect) return;
		mouseX = event.clientX - rect.left;
		mouseY = event.clientY - rect.top;
	}

	function handleMouseEnter() {
		isHovering = true;
	}

	function handleMouseLeave() {
		isHovering = false;
		isPressed = false;
	}

	let isPressed = $state(false);
	function handleMouseDown() {
		isPressed = true;
	}
	function handleMouseUp() {
		isPressed = false;
	}

	let element: HTMLElement;
	$effect(() => {
		if (element) {
			rect = element.getBoundingClientRect();
		}
	});
</script>

<div
	bind:this={element}
	role="group"
	aria-label="Interactive post card"
	class="spotlight-card relative overflow-hidden rounded-lg transition-transform duration-150 ease-out"
	class:scale-[0.98]={isPressed}
	onmousemove={handleMouseMove}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
>
	<div
		class="spotlight-effect pointer-events-none absolute -inset-px rounded-lg opacity-0 transition duration-300"
		class:opacity-100={isHovering}
		style="background: radial-gradient(
            600px circle at {mouseX}px {mouseY}px,
            rgba(var(--accent-rgb), 0.1),
            transparent 80%
        );"
	></div>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	/* You might want to define accent-rgb in your app.css or as a Svelte var */
	/* For now, assuming --accent translates to something like 56, 189, 248 for RGB */
	/* If not, we'll need to update app.css */
</style>
