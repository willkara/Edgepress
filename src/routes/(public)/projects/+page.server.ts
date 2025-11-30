import type { PageServerLoad } from './$types';
import { getFeaturedProjects } from '$lib/server/db/featured-projects';
import { getSetting } from '$lib/server/db/settings';
import { getPostTags, getPublishedPosts } from '$lib/server/db/posts';

const deriveStatus = (tags: string[], isFeatured: boolean): 'live' | 'in-progress' | 'archived' | 'featured' => {
        const lowered = tags.map((tag) => tag.toLowerCase());

        if (lowered.some((tag) => tag.includes('archived') || tag.includes('deprecated'))) {
                return 'archived';
        }

        if (lowered.some((tag) => tag.includes('in progress') || tag === 'wip' || tag === 'beta')) {
                return 'in-progress';
        }

        if (isFeatured) {
                return 'featured';
        }

        return 'live';
};

const extractLinks = (
        excerpt?: string | null,
        customDescription?: string | null
): { repoUrl?: string; liveUrl?: string } => {
        const text = [customDescription, excerpt].filter(Boolean).join(' ');
        if (!text) return {};

        const urlMatches = text.match(/https?:\/\/[\w.-]+(?:\/[\w\-./?%&=]*)?/gi) || [];

        let repoUrl: string | undefined;
        let liveUrl: string | undefined;

        for (const candidate of urlMatches) {
                const normalized = candidate.toLowerCase();
                if (!repoUrl && (normalized.includes('github.com') || normalized.includes('gitlab.com'))) {
                        repoUrl = candidate;
                        continue;
                }

                if (!liveUrl) {
                        liveUrl = candidate;
                }
        }

        return { repoUrl, liveUrl };
};

export const load: PageServerLoad = async ({ platform, url }) => {
        if (!platform?.env?.DB) {
                return {
                        projects: [],
                        availableStacks: [],
                        availableStatuses: ['all'],
                        filters: { stack: 'all', status: 'all' },
                        settings: {
                                pageTitle: 'My Projects',
                                pageSubtitle: "Explore the things I've built and the problems I've solved."
                        },
                        error: 'Database not available'
                };
        }

        const selectedStack = url.searchParams.get('stack') || 'all';
        const selectedStatus = url.searchParams.get('status') || 'all';

        try {
                const [featuredProjects, pageTitle, pageSubtitle, showAllSetting] = await Promise.all([
                        getFeaturedProjects(platform.env.DB, false), // Only get featured (visible) projects
                        getSetting(platform.env.DB, 'projects_page_title'),
                        getSetting(platform.env.DB, 'projects_page_subtitle'),
                        getSetting(platform.env.DB, 'projects_page_show_all')
                ]);

                const showAll = showAllSetting === '1';

                // If showAll is enabled, also fetch all posts with "Projects" category
                let allProjectPosts: any[] = [];
                let postTags: Record<string, string[]> = {};

                if (showAll) {
                        const allPosts = await getPublishedPosts(platform.env.DB, 100, 0);
                        allProjectPosts = allPosts.filter((post) => post.category_slug === 'projects');

                        const tagLookups = await Promise.all(
                                allProjectPosts.map(async (post) => {
                                        const tags = await getPostTags(platform.env.DB, post.id);
                                        return [post.id, tags.map((tag) => tag.name)] as const;
                                })
                        );

                        postTags = Object.fromEntries(tagLookups);
                }

                const projects = [
                        ...featuredProjects.map((fp) => {
                                const links = extractLinks(fp.post_excerpt, fp.custom_description);
                                const status = deriveStatus(fp.tags, true);

                                return {
                                        id: fp.post_id,
                                        title: fp.post_title,
                                        slug: fp.post_slug,
                                        excerpt: fp.custom_description || fp.post_excerpt,
                                        hero_image_id: fp.post_hero_image_id,
                                        published_at: fp.post_published_at,
                                        category_name: fp.category_name,
                                        tags: fp.tags,
                                        is_featured: true,
                                        status,
                                        repoUrl: links.repoUrl,
                                        liveUrl: links.liveUrl || `/blog/${fp.post_slug}`
                                };
                        }),
                        ...allProjectPosts
                                .filter((post) => !featuredProjects.find((fp) => fp.post_id === post.id))
                                .map((post) => {
                                        const tags = postTags[post.id] || [];
                                        const links = extractLinks(post.excerpt, post.content_md);
                                        const status = deriveStatus(tags, false);

                                        return {
                                                id: post.id,
                                                title: post.title,
                                                slug: post.slug,
                                                excerpt: post.excerpt,
                                                hero_image_id: post.hero_image_id,
                                                published_at: post.published_at,
                                                category_name: post.category_name,
                                                tags,
                                                is_featured: false,
                                                status,
                                                repoUrl: links.repoUrl,
                                                liveUrl: links.liveUrl || `/blog/${post.slug}`
                                        };
                                })
                ];

                const availableStacks = Array.from(
                        new Set(projects.flatMap((project) => project.tags || []))
                ).sort((a, b) => a.localeCompare(b));

                const availableStatuses = Array.from(
                        new Set(['all', ...projects.map((project) => project.status)])
                );

                const filteredProjects = projects.filter((project) => {
                        const stackMatches =
                                selectedStack === 'all' || project.tags?.includes(selectedStack);
                        const statusMatches = selectedStatus === 'all' || project.status === selectedStatus;
                        return stackMatches && statusMatches;
                });

                return {
                        projects: filteredProjects,
                        availableStacks,
                        availableStatuses,
                        filters: {
                                stack: selectedStack,
                                status: selectedStatus
                        },
                        settings: {
                                pageTitle: pageTitle || 'My Projects',
                                pageSubtitle:
                                        pageSubtitle || "Explore the things I've built and the problems I've solved."
                        },
                        error: null
                };
        } catch (err: any) {
                console.error('Failed to load projects page:', err);
                return {
                        projects: [],
                        availableStacks: [],
                        availableStatuses: ['all'],
                        filters: { stack: selectedStack, status: selectedStatus },
                        settings: {
                                pageTitle: 'My Projects',
                                pageSubtitle: "Explore the things I've built and the problems I've solved."
                        },
                        error: 'Failed to load projects page'
                };
        }
};
