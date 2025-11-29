import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ platform }): Response => {
	if (!platform?.env) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Platform environment not available'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	const { CF_ACCOUNT_ID, CF_IMAGES_HASH, CF_IMAGES_TOKEN } = platform.env;

	// Check which variables are configured
	const config = {
		configured: true,
		accountId: CF_ACCOUNT_ID || 'NOT SET',
		imagesHash: CF_IMAGES_HASH || 'NOT SET',
		tokenPresent: !!CF_IMAGES_TOKEN,
		deliveryUrl: CF_IMAGES_HASH
			? `https://imagedelivery.net/${CF_IMAGES_HASH}/{IMAGE_ID}/public`
			: 'N/A - hash not set'
	};

	const allConfigured = CF_ACCOUNT_ID && CF_IMAGES_HASH && CF_IMAGES_TOKEN;

	return new Response(
		JSON.stringify({
			success: allConfigured,
			message: allConfigured
				? 'Cloudflare Images is fully configured!'
				: 'Some Cloudflare Images settings are missing',
			config
		}),
		{
			status: allConfigured ? 200 : 500,
			headers: { 'Content-Type': 'application/json' }
		}
	);
};
