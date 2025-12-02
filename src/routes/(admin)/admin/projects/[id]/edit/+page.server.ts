import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProjectById, updateProject } from '$lib/server/db/projects';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = platform?.env?.DB;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const project = await getProjectById(db, params.id);
	if (!project) {
		throw error(404, 'Project not found');
	}

	return { project };
};

export const actions: Actions = {
	default: async ({ request, platform, params, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const title = data.get('title') as string;
		const slug = data.get('slug') as string;
		const description = data.get('description') as string;
		const content_md = data.get('content_md') as string;
		const repo_url = data.get('repo_url') as string;
		const demo_url = data.get('demo_url') as string;
		const tech_stack_str = data.get('tech_stack') as string;
		const is_featured = data.get('is_featured') === 'on';
		const hero_image_id = data.get('hero_image_id') as string;

		if (!title || !slug || !description) {
			return { error: 'Missing required fields' };
		}

		try {
			const db = platform?.env?.DB;
			if (!db) {
				throw error(500, 'Database not available');
			}

			await updateProject(db, params.id, {
				title,
				slug,
				description,
				content_md: content_md ?? null,
				repo_url: repo_url ?? null,
				demo_url: demo_url ?? null,
				tech_stack: tech_stack_str
					? tech_stack_str
							.split(',')
							.map((t) => t.trim())
							.filter(Boolean)
					: [],
				is_featured,
				hero_image_id: hero_image_id ?? null
			});
		} catch (err) {
			console.error('Failed to update project:', err);
			return { error: (err as any).message ?? 'Failed to update project' };
		}

		throw redirect(303, '/admin/projects');
	}
};
