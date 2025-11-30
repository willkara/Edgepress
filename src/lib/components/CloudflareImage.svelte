<script lang="ts">
	import { onMount } from 'svelte';

	let {
		imageId,
		alt,
		blurhash,
		width,
		height,
		variant = 'public',
		class: className = '',
		eager = false
	}: {
		imageId: string;
		alt: string;
		blurhash?: string;
		width?: number;
		height?: number;
		variant?: string;
		class?: string;
		eager?: boolean;
	} = $props();

	let loaded = $state(false);
	let error = $state(false);
	let imageRef: HTMLImageElement | null = null;

	// Cloudflare Images delivery URL
	const CF_IMAGES_URL = 'https://imagedelivery.net/YOUR_CF_ACCOUNT_HASH';

	// Build image URL with variant
	const imageUrl = `${CF_IMAGES_URL}/${imageId}/${variant}`;

	// Generate LQIP data URL from blurhash if provided
	function blurhashToDataUrl(hash: string): string {
		// For now, return a simple gray placeholder
		// In production, you'd use the blurhash library to decode
		return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 400} ${height || 300}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='none' style='filter: url(%23b);' href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8f/78fwAI+AP0Poy5GAAAAABJRU5ErkJggg=='/%3E%3C/svg%3E`;
	}

	onMount(() => {
		if (!eager && imageRef) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						loaded = true;
						observer.disconnect();
					}
				});
			});

			observer.observe(imageRef);

			return () => observer.disconnect();
		} else {
			loaded = true;
		}
	});
</script>

<div class="cloudflare-image {className}" class:loaded class:error>
	{#if blurhash && !loaded}
		<img
			src={blurhashToDataUrl(blurhash)}
			alt=""
			class="placeholder"
			aria-hidden="true"
		/>
	{/if}

	<img
		bind:this={imageRef}
		src={loaded ? imageUrl : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}
		{alt}
		{width}
		{height}
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
		class="main-image"
		class:visible={loaded}
		onerror={() => (error = true)}
		onload={() => (loaded = true)}
	/>
</div>

<style>
	.cloudflare-image {
		position: relative;
		overflow: hidden;
		background: var(--bg-soft);
		border-radius: 0.5rem;
	}

	.cloudflare-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		position: absolute;
		inset: 0;
		filter: blur(20px);
		transform: scale(1.1);
		opacity: 1;
		transition: opacity 300ms ease;
	}

	.main-image {
		opacity: 0;
		transition: opacity 400ms ease;
	}

	.main-image.visible {
		opacity: 1;
	}

	.loaded .placeholder {
		opacity: 0;
	}

	.error {
		background: var(--bg-elevated);
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}

	.error::after {
		content: 'Image failed to load';
		color: var(--text-subtle);
		font-size: 0.875rem;
	}
</style>
