<script lang="ts">
	import { enhance } from '$app/forms';
	import { Loader2, Mail, MessageSquare, Send, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { ActionData } from './$types';

	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);

	// Watch for form result and show toast
	$effect(() => {
		if (form) {
			loading = false;
			if (form.success) {
				toast.success('Message sent!', {
					description: "Thanks for reaching out. I'll get back to you soon."
				});
				// Reset the form if needed, though native form reset might be handled by browser or logic
			} else if (form.error) {
				toast.error('Failed to send message', {
					description: form.message || 'Please try again later.'
				});
			}
		}
	});
</script>

<svelte:head>
	<title>Contact | EdgePress</title>
	<meta name="description" content="Get in touch with me." />
</svelte:head>

<div class="container max-w-2xl py-12 px-4 mx-auto text-white">
	<div class="mb-10 text-center">
		<h1 class="text-4xl font-bold tracking-tight mb-4 font-space">Get in Touch</h1>
		<p class="text-gray-400">
			Have a question, proposal, or just want to say hello? Go ahead.
		</p>
	</div>

	<Card class="bg-[#050816] border-white/10 shadow-lg">
		<CardContent class="p-6 md:p-8">
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="space-y-6"
			>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Name -->
					<div class="space-y-2">
						<Label for="name" class="text-gray-300">Name</Label>
						<div class="relative">
							<div class="absolute left-3 top-3 text-gray-500 z-10">
								<User class="h-4 w-4" />
							</div>
							<Input
								type="text"
								id="name"
								name="name"
								value={form?.data?.name ?? ''}
								placeholder="Your name"
								required
								class="pl-10 bg-[#020617] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#38bdf8]"
							/>
						</div>
						{#if form?.errors?.name}
							<p class="text-sm text-red-500">{form.errors.name}</p>
						{/if}
					</div>

					<!-- Email -->
					<div class="space-y-2">
						<Label for="email" class="text-gray-300">Email</Label>
						<div class="relative">
							<div class="absolute left-3 top-3 text-gray-500 z-10">
								<Mail class="h-4 w-4" />
							</div>
							<Input
								type="email"
								id="email"
								name="email"
								value={form?.data?.email ?? ''}
								placeholder="name@example.com"
								required
								class="pl-10 bg-[#020617] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#38bdf8]"
							/>
						</div>
						{#if form?.errors?.email}
							<p class="text-sm text-red-500">{form.errors.email}</p>
						{/if}
					</div>
				</div>

				<!-- Subject -->
				<div class="space-y-2">
					<Label for="subject" class="text-gray-300">Subject</Label>
					<div class="relative">
						<div class="absolute left-3 top-3 text-gray-500 z-10">
							<MessageSquare class="h-4 w-4" />
						</div>
						<Input
							type="text"
							id="subject"
							name="subject"
							value={form?.data?.subject ?? ''}
							placeholder="What is this about?"
							required
							class="pl-10 bg-[#020617] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#38bdf8]"
						/>
					</div>
					{#if form?.errors?.subject}
						<p class="text-sm text-red-500">{form.errors.subject}</p>
					{/if}
				</div>

				<!-- Message -->
				<div class="space-y-2">
					<Label for="message" class="text-gray-300">Message</Label>
					<Textarea
						id="message"
						name="message"
						rows={6}
						value={form?.data?.message ?? ''}
						placeholder="Your message..."
						required
						class="bg-[#020617] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#38bdf8] min-h-[120px]"
					/>
					{#if form?.errors?.message}
						<p class="text-sm text-red-500">{form.errors.message}</p>
					{/if}
				</div>

				<div class="pt-2">
					<Button
						type="submit"
						disabled={loading}
						class="rounded-full w-full sm:w-auto bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-[#0f172a] hover:brightness-110 shadow-[0_0_20px_rgba(56,189,248,0.3)] border-0"
					>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Sending...
						{:else}
							<Send class="mr-2 h-4 w-4" />
							Send Message
						{/if}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>

<style>
    .font-space {
        font-family: 'Space Grotesk', system-ui, sans-serif;
    }
</style>
