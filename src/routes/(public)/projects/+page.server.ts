import type { PageServerLoad } from './$types';
import type { D1Database } from '@cloudflare/workers-types';
import { error } from '@sveltejs/kit';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import { getSetting } from '$lib/server/db/settings';
import { getProjects, type Project } from '$lib/server/db/projects';
import { getPostBySlug } from '$lib/server/db/posts';

interface ProjectWithPostLink extends Project {
        post_slug?: string;
        post_title?: string;
        post_published_at?: string;
}

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
        if (!platform?.env?.DB) {
                throw error(500, 'Database not available');
        }

        try {
                setCacheHeaders(setHeaders, CachePresets.publicPage());

                const [projects, pageTitle, pageSubtitle] = await Promise.all([
                        getProjects(platform.env.DB),
                        getSetting(platform.env.DB, 'projects_page_title'),
                        getSetting(platform.env.DB, 'projects_page_subtitle')
                ]);

                const projectsWithPosts = await enrichProjectsWithPosts(platform.env.DB, projects);

                return {
                        projects: projectsWithPosts,
                        settings: {
                                pageTitle: pageTitle || 'My Projects',
                                pageSubtitle:
                                        pageSubtitle || "Explore the things I've built and the problems I've solved."
                        }
                };
        } catch (err) {
                console.error('Failed to load projects page:', err);
                throw error(500, 'Failed to load projects page');
        }
};

async function enrichProjectsWithPosts(
        db: D1Database,
        projects: Project[]
): Promise<ProjectWithPostLink[]> {
        const postLookups = await Promise.all(projects.map((project) => getProjectPost(db, project.slug)));

        const postMap = new Map(
                postLookups
                        .filter((post): post is NonNullable<typeof post> => Boolean(post))
                        .map((post) => [post.slug, post])
        );

        return projects.map((project) => {
                const post = postMap.get(project.slug);

                if (!post) {
                        return project;
                }

                return {
                        ...project,
                        post_slug: post.slug,
                        post_title: post.title,
                        post_published_at: post.published_at
                };
        });
}

async function getProjectPost(db: D1Database, slug: string) {
        const post = await getPostBySlug(db, slug);

        if (!post) {
                return null;
        }

        return {
                slug: post.slug,
                title: post.title,
                published_at: post.published_at
        };
}
