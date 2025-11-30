<script lang="ts">
	import { ThumbsUp, Heart, Bookmark } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let {
		postId,
		initialLikes = 0,
		initialHearts = 0,
		initialBookmarks = 0
	}: {
		postId: string;
		initialLikes?: number;
		initialHearts?: number;
		initialBookmarks?: number;
	} = $props();

	let likes = $state(initialLikes);
	let hearts = $state(initialHearts);
	let bookmarks = $state(initialBookmarks);

	let userReactions = $state<Set<string>>(new Set());
	let isLoading = $state(false);

	// Get browser fingerprint (simple version)
	function getFingerprint(): string {
		const stored = localStorage.getItem('user_fingerprint');
		if (stored) return stored;

		const fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		localStorage.setItem('user_fingerprint', fingerprint);
		return fingerprint;
	}

	// Load user's reactions
	onMount(async () => {
		const fingerprint = getFingerprint();
		try {
			const response = await fetch(`/api/reactions/${postId}?fingerprint=${fingerprint}`);
			if (response.ok) {
				const data = await response.json();
				userReactions = new Set(data.userReactions || []);
			}
		} catch (error) {
			console.error('Failed to load reactions:', error);
		}
	});

	async function toggleReaction(type: 'like' | 'heart' | 'bookmark') {
		if (isLoading) return;

		isLoading = true;
		const fingerprint = getFingerprint();
		const hadReaction = userReactions.has(type);

		// Optimistic update
		if (hadReaction) {
			userReactions.delete(type);
			if (type === 'like') likes--;
			else if (type === 'heart') hearts--;
			else bookmarks--;
		} else {
			userReactions.add(type);
			if (type === 'like') likes++;
			else if (type === 'heart') hearts++;
			else bookmarks++;
		}

		try {
			const response = await fetch(`/api/reactions/${postId}`, {
				method: hadReaction ? 'DELETE' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type, fingerprint })
			});

			if (!response.ok) {
				// Revert on error
				if (hadReaction) {
					userReactions.add(type);
					if (type === 'like') likes++;
					else if (type === 'heart') hearts++;
					else bookmarks++;
				} else {
					userReactions.delete(type);
					if (type === 'like') likes--;
					else if (type === 'heart') hearts--;
					else bookmarks--;
				}
			}
		} catch (error) {
			console.error('Failed to toggle reaction:', error);
			// Revert on error
			if (hadReaction) {
				userReactions.add(type);
				if (type === 'like') likes++;
				else if (type === 'heart') hearts++;
				else bookmarks++;
			} else {
				userReactions.delete(type);
				if (type === 'like') likes--;
				else if (type === 'heart') hearts--;
				else bookmarks--;
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="post-reactions">
	<h4 class="reactions-title">Enjoying this post?</h4>

	<div class="reactions-buttons">
		<button
			class="reaction-button"
			class:active={userReactions.has('like')}
			onclick={() => toggleReaction('like')}
			disabled={isLoading}
			aria-label={userReactions.has('like') ? 'Unlike post' : 'Like post'}
		>
			<ThumbsUp class="reaction-icon" />
			<span class="reaction-count">{likes}</span>
			<span class="reaction-label">Like</span>
		</button>

		<button
			class="reaction-button"
			class:active={userReactions.has('heart')}
			onclick={() => toggleReaction('heart')}
			disabled={isLoading}
			aria-label={userReactions.has('heart') ? 'Remove heart' : 'Heart post'}
		>
			<Heart class="reaction-icon" />
			<span class="reaction-count">{hearts}</span>
			<span class="reaction-label">Love</span>
		</button>

		<button
			class="reaction-button"
			class:active={userReactions.has('bookmark')}
			onclick={() => toggleReaction('bookmark')}
			disabled={isLoading}
			aria-label={userReactions.has('bookmark') ? 'Remove bookmark' : 'Bookmark post'}
		>
			<Bookmark class="reaction-icon" />
			<span class="reaction-count">{bookmarks}</span>
			<span class="reaction-label">Save</span>
		</button>
	</div>
</div>

<style>
	.post-reactions {
		margin: 3rem 0;
		padding: 2rem;
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
	}

	.reactions-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 1.25rem;
		text-align: center;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.reactions-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.reaction-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		background: var(--bg-soft);
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
		color: var(--text-main);
		cursor: pointer;
		transition: all 200ms;
		min-width: 90px;
	}

	.reaction-button:hover:not(:disabled) {
		transform: translateY(-2px);
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.reaction-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.reaction-button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.reaction-button.active {
		background: var(--accent-soft);
		border-color: var(--accent);
	}

	.reaction-button.active .reaction-icon {
		color: var(--accent);
		fill: var(--accent);
	}

	.reaction-icon {
		width: 1.5rem;
		height: 1.5rem;
		transition: all 200ms;
	}

	.reaction-count {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
		font-family: 'Space Grotesk', system-ui, sans-serif;
	}

	.reaction-label {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	@media (max-width: 640px) {
		.post-reactions {
			padding: 1.5rem;
		}

		.reactions-buttons {
			gap: 0.75rem;
		}

		.reaction-button {
			padding: 0.875rem 1.125rem;
			min-width: 75px;
		}

		.reaction-icon {
			width: 1.25rem;
			height: 1.25rem;
		}

		.reaction-count {
			font-size: 1rem;
		}
	}
</style>
