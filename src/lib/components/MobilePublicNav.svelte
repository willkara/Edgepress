<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Menu } from 'lucide-svelte';
	import PublicSidebar from './PublicSidebar.svelte';
	import type { PublicUser } from '$lib/server/auth/types';

	let { user }: { user: PublicUser | undefined } = $props();
	let open = $state(false);

    // Close sheet on navigation
    import { page } from '$app/stores';
    $effect(() => {
        // dep on page url
        $page.url.pathname;
        open = false;
    });
</script>

<header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
	<div class="container flex h-14 items-center px-4">
		<Sheet.Root bind:open>
			<Sheet.Trigger>
                {#snippet child({ props })}
                    <Button variant="ghost" size="icon" class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden" {...props}>
                        <Menu class="h-6 w-6" />
                        <span class="sr-only">Toggle Menu</span>
                    </Button>
                {/snippet}
			</Sheet.Trigger>
			<Sheet.Content side="left" class="p-0 w-[280px]">
                <div class="h-full">
				    <PublicSidebar {user} />
                </div>
			</Sheet.Content>
		</Sheet.Root>
        <div class="flex-1 flex justify-center lg:hidden">
             <span class="font-bold font-space text-lg">EdgePress</span>
        </div>
        <div class="w-9">
            <!-- Spacer to center the title roughly -->
        </div>
	</div>
</header>

<style>
    .font-space {
        font-family: 'Space Grotesk', system-ui, sans-serif;
    }
</style>
