<script lang="ts">
	import type { LayoutData } from './$types';

    // The layout is now handled by the Theme Engine templates (base.njk)
    // This file just acts as a data provider/pass-through for children.
	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<!--
    We just render the children.
    The child pages (+page.svelte) will invoke ThemeRenderer.
    ThemeRenderer renders 'base.njk' which contains the sidebar and flex structure.
-->
{@render children()}
