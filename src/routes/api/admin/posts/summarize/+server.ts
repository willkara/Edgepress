import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const body = (await request.json()) as { content?: unknown };
	const { content } = body;

	if (!content || typeof content !== 'string') {
		throw error(400, 'Content is required');
	}

	// Trim content if too long (most models have token limits)
	// Cloudflare AI models typically handle ~2048 tokens
	const maxLength = 8000; // Approximate character limit
	const trimmedContent = content.length > maxLength ? content.substring(0, maxLength) : content;

	try {
		const ai = platform?.env.AI;
		if (!ai || typeof ai !== 'object' || typeof (ai as { run?: unknown }).run !== 'function') {
			throw error(500, 'AI service not available');
		}

		// Use Cloudflare's BART model for summarization
		// This model is optimized for generating concise summaries
		const aiClient = ai as {
			run: (
				model: string,
				options: { input_text: string; max_length?: number }
			) => Promise<unknown>;
		};
		const response = await aiClient.run('@cf/facebook/bart-large-cnn', {
			input_text: trimmedContent,
			max_length: 150 // Maximum summary length in tokens
		});

		if (!response || typeof response !== 'object') {
			throw error(500, 'Invalid summary response');
		}

		const result = response as { summary?: unknown };
		if (typeof result.summary !== 'string') {
			throw error(500, 'Invalid summary response');
		}

		return json({
			summary: result.summary
		});
	} catch (err) {
		console.error('AI summarization error:', err);
		throw error(500, 'Failed to generate summary');
	}
};
