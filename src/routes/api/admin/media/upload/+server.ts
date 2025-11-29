import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';
import { createMedia } from '$lib/server/db/media';

export const POST: RequestHandler = async ({ platform, locals, request }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	if (
		!platform.env.CF_ACCOUNT_ID ||
		!platform.env.CF_IMAGES_TOKEN ||
		!platform.env.CF_IMAGES_HASH
	) {
		throw error(500, 'Cloudflare Images not configured');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			throw error(400, 'No file provided');
		}

		if (!file.type.startsWith('image/')) {
			throw error(400, 'File must be an image');
		}

		// Upload to Cloudflare Images
		const uploadFormData = new FormData();
		uploadFormData.append('file', file);

		const cfResponse = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${platform.env.CF_ACCOUNT_ID}/images/v1`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${platform.env.CF_IMAGES_TOKEN}`
				},
				body: uploadFormData
			}
		);

		if (!cfResponse.ok) {
			const errorText = await cfResponse.text();
			console.error('Cloudflare Images upload failed:', errorText);
			throw error(500, 'Failed to upload to Cloudflare Images');
		}

		const cfResult = await cfResponse.json();

		if (!cfResult.success || !cfResult.result) {
			throw error(500, 'Cloudflare Images returned invalid response');
		}

		const cfImageId = cfResult.result.id;
		const cfVariants = cfResult.result.variants ?? [];
		const width = cfResult.result.meta?.width ?? null;
		const height = cfResult.result.meta?.height ?? null;

		// Store in database
		const mediaId = nanoid();

		const media = await createMedia(platform.env.DB, {
			id: mediaId,
			cf_image_id: cfImageId,
			filename: file.name,
			uploaded_by: locals.user.id,
			width,
			height,
			file_size: file.size,
			mime_type: file.type
		});

		// Return media info with Cloudflare Images URL
		return json({
			mediaId: media.id,
			imageId: cfImageId,
			hash: platform.env.CF_IMAGES_HASH,
			url: `https://imagedelivery.net/${platform.env.CF_IMAGES_HASH}/${cfImageId}/public`,
			variants: cfVariants,
			width,
			height,
			filename: file.name
		});
	} catch (err) {
		console.error('Upload error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Upload failed';
		throw error(500, message);
	}
};
