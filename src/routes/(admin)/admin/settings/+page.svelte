<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	// Form state
	let formData = $state({
		general: { ...data.settings.general },
		author: { ...data.settings.author },
		social: { ...data.settings.social },
		seo: { ...data.settings.seo }
	});

	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');
	let isDirty = $state(false);

	// Detect changes
	$effect(() => {
		isDirty =
			JSON.stringify(formData.general) !== JSON.stringify(data.settings.general) ||
			JSON.stringify(formData.author) !== JSON.stringify(data.settings.author) ||
			JSON.stringify(formData.social) !== JSON.stringify(data.settings.social) ||
			JSON.stringify(formData.seo) !== JSON.stringify(data.settings.seo);
	});

	async function handleSave() {
		saving = true;
		error = '';
		successMessage = '';

		try {
			// Client-side validation
			if (!formData.general.site_title.trim()) {
				throw new Error('Site title is required');
			}

			const response = await fetch('/api/admin/settings', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save settings');
			}

			const updatedSettings = await response.json();

			// Update original data
			data.settings = updatedSettings;
			formData = {
				general: { ...updatedSettings.general },
				author: { ...updatedSettings.author },
				social: { ...updatedSettings.social },
				seo: { ...updatedSettings.seo }
			};

			successMessage = 'Settings saved successfully!';
			await invalidateAll();

			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		} catch (err: any) {
			error = err.message || 'Failed to save settings';
		} finally {
			saving = false;
		}
	}

	function handleReset() {
		formData = {
			general: { ...data.settings.general },
			author: { ...data.settings.author },
			social: { ...data.settings.social },
			seo: { ...data.settings.seo }
		};
		error = '';
		successMessage = '';
	}
</script>

<svelte:head>
	<title>Settings - EdgePress</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1>Settings</h1>
		<div class="actions">
			<button class="btn-secondary" onclick={handleReset} disabled={saving || !isDirty}>
				Reset
			</button>
			<button class="btn-primary" onclick={handleSave} disabled={saving || !isDirty}>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</header>

	{#if successMessage}
		<div class="message message-success">
			{successMessage}
		</div>
	{/if}

	{#if error}
		<div class="message message-error">
			{error}
		</div>
	{/if}

	<div class="cards">
		<!-- General Settings Card -->
		<div class="card">
			<h2 class="card-title">General Settings</h2>
			<div class="card-content">
				<div class="form-group">
					<label for="site-title">Site Title *</label>
					<input
						id="site-title"
						type="text"
						bind:value={formData.general.site_title}
						placeholder="EdgePress"
						disabled={saving}
						maxlength="100"
						required
					/>
					<small class="hint">This appears in the browser tab and site header</small>
				</div>

				<div class="form-group">
					<label for="site-description">Site Description</label>
					<textarea
						id="site-description"
						bind:value={formData.general.site_description}
						placeholder="A modern blog platform"
						disabled={saving}
						maxlength="500"
						rows="3"
					></textarea>
					<small class="hint">A brief description of your blog (max 500 characters)</small>
				</div>

				<div class="form-group">
					<label for="site-tagline">Tagline</label>
					<input
						id="site-tagline"
						type="text"
						bind:value={formData.general.site_tagline}
						placeholder="Your blog's motto or catchphrase"
						disabled={saving}
						maxlength="100"
					/>
					<small class="hint">A short, memorable phrase (max 100 characters)</small>
				</div>
			</div>
		</div>

		<!-- Author Information Card -->
		<div class="card">
			<h2 class="card-title">Author Information</h2>
			<div class="card-content">
				<div class="form-group">
					<label for="author-name">Name</label>
					<input
						id="author-name"
						type="text"
						bind:value={formData.author.author_name}
						placeholder="Your Name"
						disabled={saving}
						maxlength="100"
					/>
					<small class="hint">Your display name (max 100 characters)</small>
				</div>

				<div class="form-group">
					<label for="author-bio">Bio</label>
					<textarea
						id="author-bio"
						bind:value={formData.author.author_bio}
						placeholder="Tell readers about yourself..."
						disabled={saving}
						maxlength="1000"
						rows="4"
					></textarea>
					<small class="hint">A brief biography (max 1000 characters)</small>
				</div>

				<div class="form-group">
					<label for="author-email">Email</label>
					<input
						id="author-email"
						type="email"
						bind:value={formData.author.author_email}
						placeholder="you@example.com"
						disabled={saving}
					/>
					<small class="hint">Contact email address</small>
				</div>
			</div>
		</div>

		<!-- Social Links Card -->
		<div class="card">
			<h2 class="card-title">Social Links</h2>
			<div class="card-content">
				<div class="form-group">
					<label for="twitter-url">Twitter/X URL</label>
					<input
						id="twitter-url"
						type="url"
						bind:value={formData.social.twitter_url}
						placeholder="https://twitter.com/username"
						disabled={saving}
					/>
					<small class="hint">Your Twitter/X profile URL</small>
				</div>

				<div class="form-group">
					<label for="github-url">GitHub URL</label>
					<input
						id="github-url"
						type="url"
						bind:value={formData.social.github_url}
						placeholder="https://github.com/username"
						disabled={saving}
					/>
					<small class="hint">Your GitHub profile URL</small>
				</div>

				<div class="form-group">
					<label for="linkedin-url">LinkedIn URL</label>
					<input
						id="linkedin-url"
						type="url"
						bind:value={formData.social.linkedin_url}
						placeholder="https://linkedin.com/in/username"
						disabled={saving}
					/>
					<small class="hint">Your LinkedIn profile URL</small>
				</div>
			</div>
		</div>

		<!-- SEO & Metadata Card -->
		<div class="card">
			<h2 class="card-title">SEO & Metadata</h2>
			<div class="card-content">
				<div class="form-group">
					<label for="meta-title-suffix">Title Suffix</label>
					<input
						id="meta-title-suffix"
						type="text"
						bind:value={formData.seo.meta_title_suffix}
						placeholder=" | EdgePress"
						disabled={saving}
						maxlength="50"
					/>
					<small class="hint">Appended to page titles (max 50 characters)</small>
				</div>

				<div class="form-group">
					<label for="meta-description">Default Meta Description</label>
					<textarea
						id="meta-description"
						bind:value={formData.seo.meta_description_default}
						placeholder="Default description for search engines..."
						disabled={saving}
						maxlength="160"
						rows="2"
					></textarea>
					<small class="hint">Fallback meta description (max 160 characters)</small>
				</div>

				<div class="form-group">
					<label for="og-image-url">Default OpenGraph Image</label>
					<input
						id="og-image-url"
						type="url"
						bind:value={formData.seo.og_image_url}
						placeholder="https://example.com/default-image.jpg"
						disabled={saving}
					/>
					<small class="hint">Default image for social media sharing</small>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-primary {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-secondary {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.btn-secondary:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-primary:disabled,
	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.message {
		padding: 1rem;
		border-radius: 0.375rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.message-success {
		background: hsl(var(--primary) / 0.1);
		border: 1px solid hsl(var(--primary));
		color: hsl(var(--primary));
	}

	.message-error {
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive));
		color: hsl(var(--destructive));
	}

	.cards {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.card {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.card-title {
		font-size: 1.125rem;
		font-weight: 600;
		padding: 1.25rem 1.5rem;
		margin: 0;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
	}

	.card-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	.form-group input,
	.form-group textarea {
		padding: 0.625rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: hsl(var(--primary));
	}

	.form-group input:disabled,
	.form-group textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
		font-family: inherit;
	}

	.hint {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.actions {
			width: 100%;
		}

		.btn-primary,
		.btn-secondary {
			flex: 1;
		}

		.card-content {
			padding: 1rem;
		}
	}
</style>
