<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { User, LogOut, LayoutDashboard } from '@lucide/svelte';
	import type { PublicUser } from '$lib/server/auth/types';

	let { user }: { user: PublicUser | undefined } = $props();

	async function handleLogout() {
		const response = await fetch('/api/auth/logout', { method: 'POST' });
		if (response.ok) {
			window.location.href = '/login';
		}
	}
</script>

{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props} class="relative h-8 w-8 rounded-full">
					<div
						class="flex h-full w-full items-center justify-center rounded-full bg-muted border border-border"
					>
						<span class="font-medium text-xs"
							>{user.display_name?.charAt(0) || user.email.charAt(0).toUpperCase()}</span
						>
					</div>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-56">
			<DropdownMenu.Label>
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">{user.display_name || 'User'}</p>
					<p class="text-xs leading-none text-muted-foreground">{user.email}</p>
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.Item onclick={() => window.location.href = '/admin'}>
					<LayoutDashboard class="mr-2 h-4 w-4" />
					<span>Admin Dashboard</span>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={handleLogout}>
				<LogOut class="mr-2 h-4 w-4" />
				<span>Log out</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<Button href="/admin" variant="ghost" size="sm">
		<User class="mr-2 h-4 w-4" />
		Login
	</Button>
{/if}
