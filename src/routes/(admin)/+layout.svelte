<script lang="ts">
	import AdminShell from '$lib/components/admin/AdminShell.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

{#if data.user}
	<AdminShell user={data.user}>
		{@render children()}
	</AdminShell>
{:else}
	<!-- Login page (no shell) -->
	{@render children()}
{/if}
