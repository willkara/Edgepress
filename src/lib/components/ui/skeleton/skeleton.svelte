<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ref?: HTMLDivElement | null;
	}

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: Props = $props();
</script>

<div
	bind:this={ref}
	data-slot="skeleton"
	class={cn("bg-accent animate-pulse rounded-md", className)}
	{...restProps}
></div>
