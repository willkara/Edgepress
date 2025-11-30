<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCaptionElement> {
		ref?: HTMLTableCaptionElement | null;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<caption
	bind:this={ref}
	data-slot="table-caption"
	class={cn('text-muted-foreground mt-4 text-sm', className)}
	{...restProps as any}
>
	{@render children?.()}
</caption>
