
// src/lib/theme/engine.ts
import nunjucks from 'nunjucks';
import { loadTemplates } from './loader';

interface ILoader {
    templates: Record<string, string>;
    getSource(name: string): any;
}

const extension: any = {
    init: function(templates: Record<string, string>) {
        // @ts-ignore
        this.templates = templates;
    },

    getSource: function(name: string) {
        // @ts-ignore
        const tmpl = this.templates[name];
        if (tmpl) {
            return {
                src: tmpl,
                path: name,
                noCache: false
            };
        }
        // Try adding .njk if missing
        // @ts-ignore
        const tmplNjk = this.templates[name + '.njk'];
        if (!name.endsWith('.njk') && tmplNjk) {
             return {
                src: tmplNjk,
                path: name + '.njk',
                noCache: false
            };
        }

        throw new Error(`Template not found: ${name}`);
    }
};

// Custom loader for Nunjucks that uses our pre-loaded map
const NunjucksLoader = nunjucks.Loader.extend(extension);

export class ThemeEngine {
    env: nunjucks.Environment;

    constructor() {
        const templates = loadTemplates();
        const loader = new (NunjucksLoader as any)(templates);
        this.env = new nunjucks.Environment(loader, {
            autoescape: true,
            throwOnUndefined: false
        });

        // Add custom extension/shortcode for Svelte Components (Islands)
        this.env.addGlobal('component', (name: string, props: any = {}) => {
            const propsStr = JSON.stringify(props).replace(/"/g, '&quot;');
            return new nunjucks.runtime.SafeString(
                `<div data-island="${name}" data-props="${propsStr}"></div>`
            );
        });

        // Add date filters
        this.env.addFilter('date_standard', (str: string) => {
             try {
                const date = new Date(str);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
             } catch (e) { return str; }
        });

        this.env.addFilter('date_relative', (str: string) => {
             try {
                const date = new Date(str);
                const now = new Date();
                const diff = (now.getTime() - date.getTime()) / 1000;
                if (diff < 60) return 'just now';
                if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
                if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
                return date.toLocaleDateString();
             } catch (e) { return str; }
        });
    }

    render(templateName: string, context: any): string {
        return this.env.render(templateName, context);
    }
}

export const themeEngine = new ThemeEngine();
