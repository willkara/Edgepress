import { fail } from '@sveltejs/kit';
import { Resend } from 'resend';
import { z } from 'zod';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

// Validation schema
const contactSchema = z.object({
	name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
	email: z.string().email({ message: 'Please enter a valid email address.' }),
	subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
	message: z.string().min(10, { message: 'Message must be at least 10 characters.' })
});

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		// Validate input
		const result = contactSchema.safeParse(data);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				error: true,
				message: 'Please check your input.',
				errors: {
					name: errors.name?.[0],
					email: errors.email?.[0],
					subject: errors.subject?.[0],
					message: errors.message?.[0]
				}
			});
		}

		const { name, email, subject, message } = result.data;

		// Check for API key
		const apiKey = env.RESEND_API_KEY;
		const contactEmail = env.CONTACT_EMAIL;

		if (!apiKey || !contactEmail) {
			console.error('Missing RESEND_API_KEY or CONTACT_EMAIL environment variables.');
			return fail(500, {
				error: true,
				message: 'Server configuration error. Please contact the administrator directly.',
				errors: {} as Record<string, string | undefined>
			});
		}

		const resend = new Resend(apiKey);

		try {
			// Construct HTML email
			const htmlContent = `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9; }
						.header { background-color: #fff; padding: 20px; border-bottom: 1px solid #eee; border-radius: 8px 8px 0 0; }
						.content { padding: 20px; background-color: #fff; border-radius: 0 0 8px 8px; }
						.field { margin-bottom: 15px; }
						.label { font-weight: bold; color: #555; font-size: 0.9em; text-transform: uppercase; margin-bottom: 5px; }
						.value { font-size: 1.1em; }
						.message-box { background-color: #f5f5f5; padding: 15px; border-radius: 4px; border-left: 4px solid #000; white-space: pre-wrap; }
						.footer { margin-top: 20px; font-size: 0.8em; color: #888; text-align: center; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h2 style="margin:0;">New Contact Form Submission</h2>
						</div>
						<div class="content">
							<div class="field">
								<div class="label">From</div>
								<div class="value">${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</div>
							</div>

							<div class="field">
								<div class="label">Subject</div>
								<div class="value">${subject}</div>
							</div>

							<div class="field">
								<div class="label">Message</div>
								<div class="message-box">${message}</div>
							</div>
						</div>
						<div class="footer">
							Sent from EdgePress Contact Form
						</div>
					</div>
				</body>
				</html>
			`;

			const { error } = await resend.emails.send({
				from: 'EdgePress Contact <onboarding@resend.dev>', // Default Resend test domain, user will need to verify their own domain for production
				to: [contactEmail],
				subject: `[Contact Form] ${subject}`,
				html: htmlContent,
				replyTo: email
			});

			if (error) {
				console.error('Resend API Error:', error);
				return fail(500, {
					error: true,
					message: 'Failed to send email via provider.',
					errors: {} as Record<string, string | undefined>
				});
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error sending email:', err);
			return fail(500, {
				error: true,
				message: 'An unexpected error occurred while sending the email.',
				errors: {} as Record<string, string | undefined>
			});
		}
	}
};
