<script lang="ts">
	import AdminShell from '$lib/components/admin/AdminShell.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

{#if data.user}
	<AdminShell user={data.user}>
		{@render children()}
	</AdminShell>
{:else}
	<!-- Login page (no shell) -->
	{@render children()}
{/if}
