<script lang="ts">
	import { enhance } from '$app/forms';
	import { Loader2, Mail, MessageSquare, Send, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { ActionData } from './$types';

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

	<div class="bg-[#050816] border border-white/10 rounded-xl p-6 md:p-8 shadow-lg">
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
					<label for="name" class="text-sm font-medium leading-none text-gray-300">
						Name
					</label>
					<div class="relative">
						<div class="absolute left-3 top-3 text-gray-500">
							<User class="h-4 w-4" />
						</div>
						<input
							type="text"
							id="name"
							name="name"
							value={form?.data?.name ?? ''}
							placeholder="Your name"
							required
							class="flex h-10 w-full rounded-md border border-white/10 bg-[#020617] px-3 pl-10 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
					{#if form?.errors?.name}
						<p class="text-sm text-red-500">{form.errors.name}</p>
					{/if}
				</div>

				<!-- Email -->
				<div class="space-y-2">
					<label for="email" class="text-sm font-medium leading-none text-gray-300">
						Email
					</label>
					<div class="relative">
						<div class="absolute left-3 top-3 text-gray-500">
							<Mail class="h-4 w-4" />
						</div>
						<input
							type="email"
							id="email"
							name="email"
							value={form?.data?.email ?? ''}
							placeholder="name@example.com"
							required
							class="flex h-10 w-full rounded-md border border-white/10 bg-[#020617] px-3 pl-10 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
					{#if form?.errors?.email}
						<p class="text-sm text-red-500">{form.errors.email}</p>
					{/if}
				</div>
			</div>

			<!-- Subject -->
			<div class="space-y-2">
				<label for="subject" class="text-sm font-medium leading-none text-gray-300">
					Subject
				</label>
				<div class="relative">
					<div class="absolute left-3 top-3 text-gray-500">
						<MessageSquare class="h-4 w-4" />
					</div>
					<input
						type="text"
						id="subject"
						name="subject"
						value={form?.data?.subject ?? ''}
						placeholder="What is this about?"
						required
						class="flex h-10 w-full rounded-md border border-white/10 bg-[#020617] px-3 pl-10 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>
				{#if form?.errors?.subject}
					<p class="text-sm text-red-500">{form.errors.subject}</p>
				{/if}
			</div>

			<!-- Message -->
			<div class="space-y-2">
				<label for="message" class="text-sm font-medium leading-none text-gray-300">
					Message
				</label>
				<textarea
					id="message"
					name="message"
					rows="6"
					value={form?.data?.message ?? ''}
					placeholder="Your message..."
					required
					class="flex min-h-[80px] w-full rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
				></textarea>
				{#if form?.errors?.message}
					<p class="text-sm text-red-500">{form.errors.message}</p>
				{/if}
			</div>

			<div class="pt-2">
				<button
					type="submit"
					disabled={loading}
					class="inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-[#0f172a] hover:brightness-110 h-10 px-6 py-2 w-full sm:w-auto shadow-[0_0_20px_rgba(56,189,248,0.3)]"
				>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Sending...
					{:else}
						<Send class="mr-2 h-4 w-4" />
						Send Message
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
    .font-space {
        font-family: 'Space Grotesk', system-ui, sans-serif;
    }
</style>
