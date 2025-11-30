import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types';
import { getProjectById, updateProject } from '$lib/server/db/projects';
import { ProjectSchema } from '$lib/server/validation/schemas';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const project = await getProjectById(platform!.env.DB, params.id);
	if (!project) {
		throw error(404, 'Project not found');
	}

	// Populate form with existing data
	const form = await superValidate(zod(ProjectSchema), {
		defaults: {
			title: project.title,
			slug: project.slug,
			description: project.description,
			content_md: project.content_md,
			repo_url: project.repo_url,
			demo_url: project.demo_url,
			hero_image_id: project.hero_image_id,
			is_featured: project.is_featured,
			tech_stack_input: project.tech_stack.join(', ')
		}
	});

	return { form, project };
};

export const actions: Actions = {
	default: async ({ request, platform, params, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(ProjectSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Parse tech stack from string
			const tech_stack = form.data.tech_stack_input
				? form.data.tech_stack_input.split(',').map((t) => t.trim()).filter(Boolean)
				: [];

			await updateProject(platform!.env.DB, params.id!, {
				title: form.data.title,
				slug: form.data.slug,
				description: form.data.description,
				is_featured: form.data.is_featured,
				content_md: form.data.content_md || null,
				repo_url: form.data.repo_url || null,
				demo_url: form.data.demo_url || null,
				hero_image_id: form.data.hero_image_id || null,
				tech_stack
			});
		} catch (err: any) {
			console.error('Failed to update project:', err);
			return fail(500, { form, message: err.message });
		}

		throw redirect(303, '/admin/projects');
	}
};
