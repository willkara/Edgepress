
// src/lib/theme/loader.ts

export const loadTemplates = () => {
    // Eagerly load all .njk files as raw strings
    const modules = import.meta.glob('/src/themes/**/*.njk', {
        query: '?raw',
        eager: true,
        import: 'default'
    });

    const templates: Record<string, string> = {};

    for (const path in modules) {
        // Normalize path: remove /src/themes/default/ and extension?
        // Let's keep it relative to the theme root for now.
        // Example: /src/themes/default/pages/post.njk -> pages/post.njk
        // We assume "default" theme for now.

        // This regex strips the prefix up to the theme name.
        // Adjust regex based on if we want to support multiple themes later.
        // For now, let's just strip '/src/themes/default/'
        const key = path.replace('/src/themes/default/', '');
        templates[key] = modules[path] as string;
    }

    return templates;
};
