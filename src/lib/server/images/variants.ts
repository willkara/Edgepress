/**
 * Cloudflare Images variant utilities
 * Uses existing configured variants: hero, avatar, og, public, thumbnail
 */

/**
 * Available Cloudflare Images variants configured in the account
 */
export const ImageVariants = {
	/** Hero images for blog posts (large, optimized) */
	HERO: 'hero',
	/** Avatar images (square, small) */
	AVATAR: 'avatar',
	/** Open Graph social sharing images (1200x630) */
	OG: 'og',
	/** Public full-size images */
	PUBLIC: 'public',
	/** Small thumbnail preview images */
	THUMBNAIL: 'thumbnail'
} as const;

export type ImageVariant = (typeof ImageVariants)[keyof typeof ImageVariants];

/**
 * Build a Cloudflare Images URL with a specific variant
 */
export function buildImageUrl(
	cfImageId: string,
	variant: ImageVariant = ImageVariants.PUBLIC,
	accountHash?: string
): string {
	// If accountHash is not provided, use the delivery URL format with image ID
	// Format: https://imagedelivery.net/<account-hash>/<image-id>/<variant>
	if (accountHash) {
		return `https://imagedelivery.net/${accountHash}/${cfImageId}/${variant}`;
	}

	// Fallback format (less optimal but works)
	return `/cdn-cgi/imagedelivery/${cfImageId}/${variant}`;
}

/**
 * Generate srcset for responsive images using multiple variants
 * Useful for <img srcset="..."> attributes
 */
export function buildImageSrcSet(
	cfImageId: string,
	variants: Array<{ variant: ImageVariant; width: number }>,
	accountHash?: string
): string {
	return variants
		.map(({ variant, width }) => {
			const url = buildImageUrl(cfImageId, variant, accountHash);
			return `${url} ${width}w`;
		})
		.join(', ');
}

/**
 * Preset srcset configurations for common use cases
 */
export const SrcSetPresets = {
	/**
	 * Blog post hero image
	 * Responsive breakpoints: thumbnail (400w), public (800w), hero (1600w)
	 */
	hero: (cfImageId: string, accountHash?: string): string =>
		buildImageSrcSet(
			cfImageId,
			[
				{ variant: ImageVariants.THUMBNAIL, width: 400 },
				{ variant: ImageVariants.PUBLIC, width: 800 },
				{ variant: ImageVariants.HERO, width: 1600 }
			],
			accountHash
		),

	/**
	 * Content images (images within blog post content)
	 * Responsive breakpoints: thumbnail (400w), public (800w)
	 */
	content: (cfImageId: string, accountHash?: string): string =>
		buildImageSrcSet(
			cfImageId,
			[
				{ variant: ImageVariants.THUMBNAIL, width: 400 },
				{ variant: ImageVariants.PUBLIC, width: 800 }
			],
			accountHash
		),

	/**
	 * Avatar/profile images
	 * Single variant: avatar (optimized for small square display)
	 */
	avatar: (cfImageId: string, accountHash?: string): string =>
		buildImageUrl(cfImageId, ImageVariants.AVATAR, accountHash)
};

/**
 * Generate Open Graph meta tags for social sharing
 */
export function buildOgImageTags(
	cfImageId: string,
	accountHash?: string,
	alt?: string
): Array<{ property: string; content: string }> {
	const ogUrl = buildImageUrl(cfImageId, ImageVariants.OG, accountHash);

	return [
		{ property: 'og:image', content: ogUrl },
		{ property: 'og:image:width', content: '1200' },
		{ property: 'og:image:height', content: '630' },
		{ property: 'og:image:type', content: 'image/jpeg' },
		...(alt ? [{ property: 'og:image:alt', content: alt }] : []),
		// Twitter Card tags
		{ property: 'twitter:card', content: 'summary_large_image' },
		{ property: 'twitter:image', content: ogUrl },
		...(alt ? [{ property: 'twitter:image:alt', content: alt }] : [])
	];
}

/**
 * Get the Cloudflare account hash from environment
 * This should be set as CF_ACCOUNT_HASH in your environment variables
 */
export function getAccountHash(env?: Record<string, string | undefined>): string | undefined {
	return env?.CF_ACCOUNT_HASH;
}

/**
 * Helper to build a responsive image object for use in templates
 */
export interface ResponsiveImage {
	src: string;
	srcset: string;
	sizes: string;
	alt: string;
	loading?: 'lazy' | 'eager';
}

/**
 * Create a responsive image configuration for hero images
 */
export function createHeroImage(
	cfImageId: string,
	alt: string,
	accountHash?: string
): ResponsiveImage {
	return {
		src: buildImageUrl(cfImageId, ImageVariants.HERO, accountHash),
		srcset: SrcSetPresets.hero(cfImageId, accountHash),
		sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1600px',
		alt,
		loading: 'eager'
	};
}

/**
 * Create a responsive image configuration for content images
 */
export function createContentImage(
	cfImageId: string,
	alt: string,
	accountHash?: string
): ResponsiveImage {
	return {
		src: buildImageUrl(cfImageId, ImageVariants.PUBLIC, accountHash),
		srcset: SrcSetPresets.content(cfImageId, accountHash),
		sizes: '(max-width: 640px) 400px, 800px',
		alt,
		loading: 'lazy'
	};
}
