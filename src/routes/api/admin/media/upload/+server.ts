import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';
import { createMedia } from '$lib/server/db/media';

export const POST: RequestHandler = async ({ platform, locals, request }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const userId = locals.user?.id;

	if (!userId) {
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

	const uploadSingleFile = async (file: File, autoAltFromFilename: boolean, userId: string) => {
		if (!file.type.startsWith('image/')) {
			throw error(400, 'File must be an image');
		}

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

		const mediaId = nanoid();

		const altText = autoAltFromFilename
			? file.name
					.replace(/\.[^.]+$/, '')
					.replace(/[-_]+/g, ' ')
					.trim() || null
			: null;

		const media = await createMedia(platform.env.DB, {
			id: mediaId,
			cf_image_id: cfImageId,
			filename: file.name,
			uploaded_by: userId,
			width,
			height,
			file_size: file.size,
			mime_type: file.type,
			alt_text: altText
		});

		return {
			mediaId: media.id,
			imageId: cfImageId,
			hash: platform.env.CF_IMAGES_HASH,
			url: `https://imagedelivery.net/${platform.env.CF_IMAGES_HASH}/${cfImageId}/public`,
			variants: cfVariants,
			width,
			height,
			filename: file.name,
			altText
		};
	};

	try {
		const formData = await request.formData();
		const files: File[] = [];

		const formFiles = formData.getAll('files').filter((item): item is File => item instanceof File);
		const singleFile = formData.get('file');
		const autoAltFromFilename = formData.get('autoAltFromFilename') === 'true';

		if (formFiles.length > 0) {
			files.push(...formFiles);
		} else if (singleFile instanceof File) {
			files.push(singleFile);
		}

		if (files.length === 0) {
			throw error(400, 'No file provided');
		}

		const uploads = [];

		for (const file of files) {
			const uploadResult = await uploadSingleFile(file, autoAltFromFilename, userId);
			uploads.push(uploadResult);
		}

		return json({ uploads });
	} catch (err) {
		console.error('Upload error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Upload failed';
		throw error(500, message);
	}
};
