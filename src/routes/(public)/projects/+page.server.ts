import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import { getFeaturedProjects, getFeaturedProjectsCached } from '$lib/server/db/featured-projects';
import { getProjects } from '$lib/server/db/projects';
import { withRequestLogging } from '$lib/server/db/logger';
import { getSetting } from '$lib/server/db/settings';
import { getPublishedPosts, getPublishedPostsCached } from '$lib/server/db/posts';
import { featuredProjectSchema, projectPostSchema, type ProjectPost } from '$lib/types/projects';

type FeaturedProject = z.infer<typeof featuredProjectSchema>;

interface ProjectDisplay {
        id: string;
        title: string;
        slug: string;
        summary: string | null;
        tech_stack?: string[];
        repo_url?: string | null;
        live_url?: string | null;
        hero_image_id?: string | null;
        status?: string;
        post_slug?: string;
        post_title?: string;
        post_published_at?: string;
        tags?: string[];
}

const DEFAULT_PROJECTS_PAGE_SUBTITLE = "Explore the things I've built and the problems I've solved.";

export const load: PageServerLoad = async ({ platform, setHeaders, locals }) => {
        if (!platform?.env?.DB) {
                throw error(500, 'Database not available');
        }

        setCacheHeaders(setHeaders, CachePresets.publicPage());

        const requestId = locals.requestId as string | undefined;

        const cache = platform.env.CACHE;
        const db = platform.env.DB;

        const logDbCall = async <T>(operation: string, fn: () => Promise<T>) =>
                withRequestLogging(requestId, `projects:${operation}`, fn);

        try {
                const [featuredProjectsRaw, standaloneProjects, pageTitle, pageSubtitle, showAllSetting] =
                        await Promise.all([
                                logDbCall('featured-projects', async () =>
                                        cache
                                                ? getFeaturedProjectsCached(db, cache, false)
                                                : getFeaturedProjects(db, false)
                                ),
                                logDbCall('projects', () => getProjects(db)),
                                logDbCall('setting:projects_page_title', () =>
                                        getSetting(db, 'projects_page_title')
                                ),
                                logDbCall('setting:projects_page_subtitle', () =>
                                        getSetting(db, 'projects_page_subtitle')
                                ),
                                logDbCall('setting:projects_page_show_all', () =>
                                        getSetting(db, 'projects_page_show_all')
                                )
                        ]);

                const featuredProjects = featuredProjectSchema.array().parse(featuredProjectsRaw);
                const showAll = showAllSetting === '1';

                const mapFeaturedProject = (project: FeaturedProject): ProjectDisplay => ({
                        id: project.id,
                        title: project.post_title,
                        slug: project.post_slug,
                        summary: project.custom_description ?? project.post_excerpt ?? null,
                        hero_image_id: project.post_hero_image_id,
                        status: project.is_featured === 1 ? 'featured' : 'hidden',
                        post_slug: project.post_slug,
                        post_title: project.post_title,
                        post_published_at: project.post_published_at,
                        tags: project.tags
                });

                const mapProjectPost = (post: ProjectPost): ProjectDisplay => ({
                        id: post.id,
                        title: post.title,
                        slug: post.slug,
                        summary: post.excerpt,
                        hero_image_id: post.hero_image_id,
                        post_slug: post.slug,
                        post_title: post.title,
                        post_published_at: post.published_at,
                        tags: post.category_name ? [post.category_name] : undefined
                });

                const mappedFeaturedProjects = featuredProjects.map(mapFeaturedProject);

                // If showAll is enabled, also fetch all posts with "Projects" category
                let allProjectPosts: ProjectPost[] = [];
                if (showAll) {
                        const allPostsRaw = await logDbCall('projects-category-posts', () =>
                                cache
                                        ? getPublishedPostsCached(db, cache, 100, 0)
                                        : getPublishedPosts(db, 100, 0)
                        );

                        const parsedPosts = projectPostSchema.array().parse(allPostsRaw);
                        allProjectPosts = parsedPosts.filter((post) => post.category_slug === 'projects');
                }

                const projects: ProjectDisplay[] = showAll
                        ? allProjectPosts.map(mapProjectPost)
                        : mappedFeaturedProjects.length > 0
                                ? mappedFeaturedProjects
                                : standaloneProjects;

                return {
                        projects,
                        featuredProjects: mappedFeaturedProjects,
                        allProjectPosts: showAll ? allProjectPosts : [],
                        showAll,
                        settings: {
                                pageTitle: pageTitle || 'My Projects',
                                pageSubtitle: pageSubtitle || DEFAULT_PROJECTS_PAGE_SUBTITLE
                        }
                };
        } catch (err: any) {
                console.error('Failed to load projects page:', err);
                throw error(500, 'Failed to load projects page');
        }
};
