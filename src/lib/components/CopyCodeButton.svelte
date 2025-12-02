<script lang="ts">
	import { onMount } from 'svelte';

	let codeBlocks: NodeListOf<HTMLPreElement> | null = null;

	onMount(() => {
		// Find all code blocks and add copy buttons
		codeBlocks = document.querySelectorAll('pre');

		codeBlocks.forEach((pre) => {
			// Skip if already has a copy button
			if (pre.querySelector('.copy-button')) return;

			// Create wrapper if needed
			if (!pre.parentElement?.classList.contains('code-wrapper')) {
				const wrapper = document.createElement('div');
				wrapper.className = 'code-wrapper';
				pre.parentNode?.insertBefore(wrapper, pre);
				wrapper.appendChild(pre);
			}

			// Create copy button
			const button = document.createElement('button');
			button.className = 'copy-button';
			button.setAttribute('aria-label', 'Copy code to clipboard');
			button.innerHTML = `
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
				</svg>
			`;

			button.addEventListener('click', () => {
				const code = pre.textContent || '';
				navigator.clipboard.writeText(code).then(() => {
					button.classList.add('copied');
					button.innerHTML = `
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
					`;
					setTimeout(() => {
						button.classList.remove('copied');
						button.innerHTML = `
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
								<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
							</svg>
						`;
					}, 2000);
				});
			});

			pre.parentElement?.appendChild(button);
		});
	});
</script>

<style>
	:global(.code-wrapper) {
		position: relative;
		margin: 1.5rem 0;
	}

	:global(.copy-button) {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.375rem;
		color: var(--text-subtle);
		cursor: pointer;
		transition: all 150ms;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(8px);
		z-index: 10;
	}

	:global(.copy-button:hover) {
		background: rgba(255, 255, 255, 0.15);
		border-color: var(--accent);
		color: var(--accent);
	}

	:global(.copy-button:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	:global(.copy-button.copied) {
		background: rgba(var(--accent-rgb), 0.2);
		border-color: var(--accent);
		color: var(--accent);
	}

	:global(.copy-button svg) {
		width: 1rem;
		height: 1rem;
	}
</style>
