import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const { email } = await request.json();

		// Validate email
		if (!email || typeof email !== 'string' || !email.includes('@')) {
			return json({ error: 'Invalid email address' }, { status: 400 });
		}

		// TODO: Integrate with email service (Mailchimp, SendGrid, etc.)
		// For now, we'll just store in D1 database

		if (!platform?.env?.DB) {
			return json({ error: 'Database not available' }, { status: 500 });
		}

		const db = platform.env.DB;

		// Check if email already exists
		const existing = await db
			.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?')
			.bind(email.toLowerCase())
			.first();

		if (existing) {
			return json({ error: 'This email is already subscribed' }, { status: 400 });
		}

		// Insert new subscriber
		await db
			.prepare('INSERT INTO newsletter_subscribers (email, subscribed_at, status) VALUES (?, ?, ?)')
			.bind(email.toLowerCase(), new Date().toISOString(), 'pending')
			.run();

		return json({
			success: true,
			message: 'Successfully subscribed! Please check your email to confirm.'
		});
	} catch (error) {
		console.error('Newsletter subscription error:', error);
		return json({ error: 'Failed to subscribe. Please try again later.' }, { status: 500 });
	}
};
