import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types';
import { createProject, getAllProjects } from '$lib/server/db/projects';
import { ProjectSchema } from '$lib/server/validation/schemas';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const form = await superValidate(zod(ProjectSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(ProjectSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Get max display order to put new project at end
			const allProjects = await getAllProjects(platform!.env.DB);
			const maxOrder = allProjects.reduce((max, p) => Math.max(max, p.display_order), -1);

			// Parse tech stack from string
			const tech_stack = form.data.tech_stack_input
				? form.data.tech_stack_input.split(',').map((t) => t.trim()).filter(Boolean)
				: [];

			await createProject(platform!.env.DB, {
				title: form.data.title,
				slug: form.data.slug,
				description: form.data.description,
				is_featured: form.data.is_featured,
				// Zod .optional() returns undefined, but DB needs null
				content_md: form.data.content_md || null,
				repo_url: form.data.repo_url || null,
				demo_url: form.data.demo_url || null,
				hero_image_id: form.data.hero_image_id || null,
				tech_stack,
				display_order: maxOrder + 1
			});
		} catch (err: any) {
			console.error('Failed to create project:', err);
			// Ideally we could set a form level error here
			return fail(500, { form, message: err.message });
		}

		throw redirect(303, '/admin/projects');
	}
};
