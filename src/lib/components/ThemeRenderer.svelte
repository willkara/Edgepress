<script lang="ts">
    import { onMount, type Component } from 'svelte';
    import { themeEngine } from '../theme/engine';
    import { componentRegistry } from '../theme/registry';
    import { mount, unmount } from 'svelte';

    let { template, context = {} }: { template: string; context?: any } = $props();

    let html = $state('');
    let container: HTMLElement;
    let mountedComponents: ReturnType<typeof mount>[] = [];

    // Re-render HTML when template or context changes
    $effect(() => {
        try {
            html = themeEngine.render(template, context);
        } catch (e) {
            console.error('Theme rendering error:', e);
            html = `<div class="p-4 text-red-500">Error rendering theme: ${(e as Error).message}</div>`;
        }
    });

    // Mount "Islands" (Svelte components) whenever HTML updates
    $effect(() => {
        // Wait for DOM to update with new HTML
        if (!container || !html) return;

        // Cleanup previous mounts
        mountedComponents.forEach((comp) => unmount(comp));
        mountedComponents = [];

        // Find all island markers
        const islands = container.querySelectorAll('[data-island]');

        islands.forEach((island) => {
            const name = island.getAttribute('data-island');
            const propsStr = island.getAttribute('data-props');

            if (name && componentRegistry[name]) {
                try {
                    const props = propsStr ? JSON.parse(propsStr) : {};
                    const ComponentClass = componentRegistry[name];

                    // Mount the component on the island div
                    // Svelte 5 mount API: mount(Component, { target, props })
                    const instance = mount(ComponentClass, {
                        target: island,
                        props: props
                    });

                    mountedComponents.push(instance);
                } catch (err) {
                    console.error(`Failed to mount component ${name}:`, err);
                }
            }
        });

        // Cleanup function for this effect
        return () => {
             mountedComponents.forEach((comp) => unmount(comp));
             mountedComponents = [];
        };
    });
</script>

<div bind:this={container} class="theme-root">
    {@html html}
</div>
