<script lang="ts">
	import { enhance } from '$app/forms';
	import { Loader2, Mail, MessageSquare, Send, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ActionData } from './$types';

	type ContactFormData = ActionData & {
		data?: {
			name?: string;
			email?: string;
			subject?: string;
			message?: string;
		};
	};

	let { form }: { form: ContactFormData } = $props();
	const formData = $derived(form?.data ?? {});

	let loading = $state(false);

	$effect(() => {
		if (form) {
			loading = false;
			if (form.success) {
				toast.success('Message sent!', {
					description: "Thanks for reaching out. I'll get back to you soon."
				});
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

<section class="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12">
	<div class="space-y-3 text-center">
		<p class="text-sm font-semibold uppercase tracking-wide text-primary">Contact</p>
		<div class="space-y-2">
			<h1 class="text-4xl font-semibold tracking-tight">Get in Touch</h1>
			<p class="text-muted-foreground">Have a question, proposal, or just want to say hello?</p>
		</div>
	</div>

	<Card class="border-muted/70 shadow-sm">
		<CardHeader class="space-y-1">
			<CardTitle>Send a message</CardTitle>
			<CardDescription>Fill out the form and I will respond as soon as possible.</CardDescription>
		</CardHeader>
		<CardContent>
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
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Name</Label>
						<div class="relative">
							<User class="absolute left-3 top-3 size-4 text-muted-foreground" />
							<Input
								id="name"
								name="name"
								type="text"
								value={formData.name ?? ''}
								placeholder="Your name"
								required
								class="pl-10"
							/>
						</div>
						{#if form?.errors?.name}
							<p class="text-sm text-destructive">{form.errors.name}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="email">Email</Label>
						<div class="relative">
							<Mail class="absolute left-3 top-3 size-4 text-muted-foreground" />
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email ?? ''}
								placeholder="name@example.com"
								required
								class="pl-10"
							/>
						</div>
						{#if form?.errors?.email}
							<p class="text-sm text-destructive">{form.errors.email}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="subject">Subject</Label>
					<div class="relative">
						<MessageSquare class="absolute left-3 top-3 size-4 text-muted-foreground" />
						<Input
							id="subject"
							name="subject"
							type="text"
							value={formData.subject ?? ''}
							placeholder="What is this about?"
							required
							class="pl-10"
						/>
					</div>
					{#if form?.errors?.subject}
						<p class="text-sm text-destructive">{form.errors.subject}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="message">Message</Label>
					<Textarea
						id="message"
						name="message"
						rows={6}
						value={formData.message ?? ''}
						placeholder="Your message..."
						required
					/>
					{#if form?.errors?.message}
						<p class="text-sm text-destructive">{form.errors.message}</p>
					{/if}
				</div>

				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<p class="text-sm text-muted-foreground">I typically reply within one business day.</p>
					<Button type="submit" class="w-full sm:w-auto" disabled={loading}>
						{#if loading}
							<Loader2 class="mr-2 size-4 animate-spin" />
							Sending...
						{:else}
							<Send class="mr-2 size-4" />
							Send Message
						{/if}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</section>
