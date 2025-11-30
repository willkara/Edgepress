
// src/lib/theme/loader.ts

// Load theme configuration
// Use relative path to avoid resolution issues
import defaultThemeConfig from '../../themes/default/package.json';

export const loadTemplates = () => {
    // Eagerly load all .njk files from the default theme
    const modules = import.meta.glob('/src/themes/default/**/*.njk', {
        query: '?raw',
        eager: true,
        import: 'default'
    });

    const templates: Record<string, string> = {};

    for (const path in modules) {
        // Strip the prefix '/src/themes/default/'
        const key = path.replace('/src/themes/default/', '');
        templates[key] = modules[path] as string;
    }

    return templates;
};

export const loadThemeConfig = () => {
    return defaultThemeConfig;
};
