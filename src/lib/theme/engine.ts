
// src/lib/theme/engine.ts
import nunjucks from 'nunjucks';
import { loadTemplates, loadThemeConfig } from './loader';

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

// Custom loader
const NunjucksLoader = nunjucks.Loader.extend(extension);

export class ThemeEngine {
    env: nunjucks.Environment;
    config: any;

    constructor() {
        const templates = loadTemplates();
        this.config = loadThemeConfig();

        const loader = new (NunjucksLoader as any)(templates);
        this.env = new nunjucks.Environment(loader, {
            autoescape: true,
            throwOnUndefined: false
        });

        // --- Core Helpers ---

        // {{ component "Name", props }}
        this.env.addGlobal('component', (name: string, props: any = {}) => {
            const propsStr = JSON.stringify(props).replace(/"/g, '&quot;');
            return new nunjucks.runtime.SafeString(
                `<div data-island="${name}" data-props="${propsStr}"></div>`
            );
        });

        // {{ asset "css/screen.css" }}
        this.env.addGlobal('asset', (path: string) => {
            // For now, hardcode to default theme.
            // In a real app, we'd append a version hash from package.json
            const version = this.config.version || '1.0';
            // Ensure path doesn't start with /
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            return `/themes/default/assets/${cleanPath}?v=${version}`;
        });

        // {{ ghost_head }}
        // In the context, we should look for 'ghost_head' variable, or return default.
        this.env.addGlobal('ghost_head', function(this: any) {
            // Access context via this.ctx or we expect it to be passed?
            // Global functions don't easily access render context in Nunjucks unless we use `addGlobal`.
            // Wait, globals are global. Context variables are passed to render.
            // If we want it to be context-aware, it should be a context variable, not a global function.
            // But Ghost helpers are functions.
            // In Nunjucks, `context` is not easily accessible in global functions.
            // We can make it a specific variable passed in context.
            return new nunjucks.runtime.SafeString(
               this.ctx.ghost_head || '<meta name="generator" content="EdgePress" />'
            );
        });

        // {{ ghost_foot }}
        this.env.addGlobal('ghost_foot', function(this: any) {
             return new nunjucks.runtime.SafeString(
                this.ctx.ghost_foot || ''
             );
        });

        // {{ body_class }}
        this.env.addGlobal('body_class', function(this: any) {
            // Context should have 'context' string (e.g. 'home', 'post')
            const ctx = this.ctx.context || 'home';
            const classes = [];

            if (ctx === 'home') classes.push('home-template');
            if (ctx === 'post') classes.push('post-template');
            if (ctx === 'tag') classes.push('tag-template');
            if (ctx === 'author') classes.push('author-template');

            return classes.join(' ');
        });

        // --- Filters ---

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
        // Inject config into context
        const fullContext = {
            ...context,
            theme: { config: this.config },
            // Ensure ghost_head/foot are at least undefined if not provided
        };
        return this.env.render(templateName, fullContext);
    }
}

export const themeEngine = new ThemeEngine();
