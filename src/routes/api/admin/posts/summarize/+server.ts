import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { content } = await request.json();

	if (!content || typeof content !== 'string') {
		throw error(400, 'Content is required');
	}

	// Trim content if too long (most models have token limits)
	// Cloudflare AI models typically handle ~2048 tokens
	const maxLength = 8000; // Approximate character limit
	const trimmedContent = content.length > maxLength ? content.substring(0, maxLength) : content;

	try {
		const ai = platform?.env.AI;
		if (!ai) {
			throw error(500, 'AI service not available');
		}

		// Use Cloudflare's BART model for summarization
		// This model is optimized for generating concise summaries
		const response = await ai.run('@cf/facebook/bart-large-cnn', {
			input_text: trimmedContent,
			max_length: 150 // Maximum summary length in tokens
		});

		// Type assertion for the response structure
		const result = response as { summary: string };

		return json({
			summary: result.summary
		});
	} catch (err) {
		console.error('AI summarization error:', err);
		throw error(500, 'Failed to generate summary');
	}
};
