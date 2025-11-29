<script lang="ts">
	import type { PageData } from './$types';
	import type { InjectionPoint } from '$lib/server/db/injections';
	import { invalidateAll } from '$app/navigation';
	import InjectionEditor from '$lib/components/admin/InjectionEditor.svelte';

	let { data }: { data: PageData } = $props();

	// State
	let injections = $state(data.injections);
	let showModal = $state(false);
	let editingInjection = $state<InjectionPoint | null>(null);
	let formData = $state({
		name: '',
		location: 'body_end' as 'head' | 'body_start' | 'body_end' | 'post_before' | 'post_after',
		content: '',
		is_active: 1
	});

	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');

	const locationLabels: Record<string, { label: string; color: string }> = {
		head: { label: 'Head', color: 'hsl(262, 83%, 58%)' },
		body_start: { label: 'Body Start', color: 'hsl(221, 83%, 53%)' },
		body_end: { label: 'Body End', color: 'hsl(142, 71%, 45%)' },
		post_before: { label: 'Post Before', color: 'hsl(25, 95%, 53%)' },
		post_after: { label: 'Post After', color: 'hsl(346, 77%, 50%)' }
	};

	function openCreateModal() {
		editingInjection = null;
		formData = {
			name: '',
			location: 'body_end',
			content: '',
			is_active: 1
		};
		error = '';
		successMessage = '';
		showModal = true;
	}

	function openEditModal(injection: InjectionPoint) {
		editingInjection = injection;
		formData = {
			name: injection.name,
			location: injection.location,
			content: injection.content,
			is_active: injection.is_active
		};
		error = '';
		successMessage = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingInjection = null;
		formData = {
			name: '',
			location: 'body_end',
			content: '',
			is_active: 1
		};
		error = '';
	}

	async function handleSave() {
		saving = true;
		error = '';
		successMessage = '';

		try {
			// Client-side validation
			if (!formData.name.trim()) {
				throw new Error('Name is required');
			}
			if (formData.content.length === 0) {
				throw new Error('Content is required');
			}

			const url = editingInjection
				? `/api/admin/injections/${editingInjection.id}`
				: '/api/admin/injections';

			const method = editingInjection ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to save injection');
			}

			await invalidateAll();
			injections = data.injections;

			successMessage = editingInjection
				? 'Injection updated successfully!'
				: 'Injection created successfully!';

			setTimeout(() => {
				closeModal();
				successMessage = '';
			}, 1500);
		} catch (err: any) {
			error = err.message || 'Failed to save injection';
		} finally {
			saving = false;
		}
	}

	async function handleDelete(injection: InjectionPoint) {
		if (!confirm(`Are you sure you want to delete "${injection.name}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/injections/${injection.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to delete injection');
			}

			await invalidateAll();
			injections = data.injections;

			successMessage = 'Injection deleted successfully!';
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		} catch (err: any) {
			error = err.message || 'Failed to delete injection';
			setTimeout(() => {
				error = '';
			}, 3000);
		}
	}

	async function handleToggleActive(injection: InjectionPoint) {
		try {
			const newActiveState = injection.is_active === 1 ? 0 : 1;

			const response = await fetch(`/api/admin/injections/${injection.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ is_active: newActiveState })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to toggle injection');
			}

			await invalidateAll();
			injections = data.injections;
		} catch (err: any) {
			error = err.message || 'Failed to toggle injection';
			setTimeout(() => {
				error = '';
			}, 3000);
		}
	}
</script>

<svelte:head>
	<title>Injections - EdgePress</title>
</svelte:head>

<div class="container">
	<header class="header">
		<div>
			<h1>Injections</h1>
			<p class="subtitle">Manage custom HTML/CSS/JavaScript code injections</p>
		</div>
		<button class="btn-primary" onclick={openCreateModal}>Create Injection</button>
	</header>

	{#if successMessage && !showModal}
		<div class="message message-success">
			{successMessage}
		</div>
	{/if}

	{#if error && !showModal}
		<div class="message message-error">
			{error}
		</div>
	{/if}

	<div class="card">
		{#if injections.length === 0}
			<div class="empty-state">
				<p>No injections yet</p>
				<button class="btn-secondary" onclick={openCreateModal}>Create your first injection</button>
			</div>
		{:else}
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Location</th>
							<th>Active</th>
							<th>Updated</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each injections as injection (injection.id)}
							<tr>
								<td class="name-cell">{injection.name}</td>
								<td>
									<span
										class="location-badge"
										style="background: {locationLabels[injection.location]
											.color}20; color: {locationLabels[injection.location].color};"
									>
										{locationLabels[injection.location].label}
									</span>
								</td>
								<td>
									<button
										class="toggle-button {injection.is_active === 1 ? 'active' : 'inactive'}"
										onclick={() => handleToggleActive(injection)}
									>
										{injection.is_active === 1 ? 'Active' : 'Inactive'}
									</button>
								</td>
								<td class="date-cell">
									{new Date(injection.updated_at).toLocaleDateString()}
								</td>
								<td class="actions-cell">
									<button class="btn-icon" onclick={() => openEditModal(injection)}>Edit</button>
									<button class="btn-icon danger" onclick={() => handleDelete(injection)}
										>Delete</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div
		class="modal-overlay"
		role="button"
		tabindex="0"
		onclick={closeModal}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				closeModal();
			}
			if (e.key === 'Escape') {
				closeModal();
			}
		}}
	>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					closeModal();
				}
			}}
		>
			<div class="modal-header">
				<h2>{editingInjection ? 'Edit Injection' : 'Create Injection'}</h2>
				<button class="close-button" aria-label="Close modal" onclick={closeModal}>&times;</button>
			</div>

			<div class="modal-body">
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

				<form onsubmit={(e) => e.preventDefault()}>
					<div class="form-group">
						<label for="name">Name *</label>
						<input
							id="name"
							type="text"
							bind:value={formData.name}
							placeholder="google-analytics"
							disabled={saving}
							maxlength="100"
							required
						/>
						<small class="hint">Alphanumeric, hyphens, and underscores only (max 100 chars)</small>
					</div>

					<div class="form-group">
						<label for="location">Location *</label>
						<select id="location" bind:value={formData.location} disabled={saving} required>
							<option value="head">Head - Before &lt;/head&gt;</option>
							<option value="body_start">Body Start - After &lt;body&gt;</option>
							<option value="body_end">Body End - Before &lt;/body&gt;</option>
							<option value="post_before">Post Before - Before blog post content</option>
							<option value="post_after">Post After - After blog post content</option>
						</select>
						<small class="hint">Where this code should be injected</small>
					</div>

					<div class="form-group">
						<label for="content">Code *</label>
						<InjectionEditor bind:value={formData.content} disabled={saving} lang="html" />
						<small class="hint">HTML, CSS, or JavaScript code (max 50,000 chars)</small>
					</div>

					<div class="form-group checkbox-group">
						<label>
							<input
								type="checkbox"
								checked={!!formData.is_active}
								onchange={(e) => formData.is_active = e.currentTarget.checked ? 1 : 0}
								disabled={saving}
							/>
							<span>Active</span>
						</label>
						<small class="hint">Enable this injection immediately</small>
					</div>
				</form>
			</div>

			<div class="modal-footer">
				<button class="btn-secondary" onclick={closeModal} disabled={saving}>Cancel</button>
				<button class="btn-primary" onclick={handleSave} disabled={saving}>
					{saving ? 'Saving...' : editingInjection ? 'Update' : 'Create'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 1200px;
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
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		color: hsl(var(--muted-foreground));
		margin: 0;
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

	.card {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
	}

	.empty-state p {
		color: hsl(var(--muted-foreground));
		margin-bottom: 1.5rem;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: hsl(var(--muted) / 0.3);
	}

	th {
		text-align: left;
		padding: 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		border-bottom: 1px solid hsl(var(--border));
	}

	td {
		padding: 1rem;
		font-size: 0.875rem;
		border-bottom: 1px solid hsl(var(--border));
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr:hover {
		background: hsl(var(--muted) / 0.1);
	}

	.name-cell {
		font-weight: 500;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
	}

	.location-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.toggle-button {
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.toggle-button.active {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
	}

	.toggle-button.inactive {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.toggle-button:hover {
		opacity: 0.8;
	}

	.date-cell {
		color: hsl(var(--muted-foreground));
		white-space: nowrap;
	}

	.actions-cell {
		display: flex;
		gap: 0.5rem;
		white-space: nowrap;
	}

	.btn-icon {
		padding: 0.375rem 0.75rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
		transition: opacity 0.2s;
	}

	.btn-icon:hover {
		opacity: 0.8;
	}

	.btn-icon.danger {
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		width: 90%;
		max-width: 800px;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
	}

	.modal-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: hsl(var(--muted-foreground));
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-button:hover {
		color: hsl(var(--foreground));
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid hsl(var(--border));
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: hsl(var(--foreground));
	}

	.form-group input[type='text'],
	.form-group select {
		width: 100%;
		padding: 0.625rem;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: hsl(var(--primary));
	}

	.form-group input:disabled,
	.form-group select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}

	.checkbox-group input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}

	.checkbox-group span {
		font-size: 0.875rem;
	}

	.hint {
		display: block;
		margin-top: 0.25rem;
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

		.table-container {
			overflow-x: auto;
		}

		.modal {
			width: 95%;
			max-height: 95vh;
		}

		.actions-cell {
			flex-direction: column;
		}
	}
</style>
