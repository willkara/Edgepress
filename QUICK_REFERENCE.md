# EdgePress - Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run check            # Type check
npm run check:watch      # Type check in watch mode

# Production
npm run build            # Build for production
npm run preview          # Preview production build
npm run deploy           # Deploy to Cloudflare Pages
```

## 📦 Creating New Components

### 1. Create Component File

```bash
# Example: Creating an Input component
mkdir -p src/lib/components/ui/input
touch src/lib/components/ui/input/Input.svelte
```

### 2. Component Template (shadcn-svelte pattern)

```svelte
<!-- Input.svelte -->
<script lang="ts">
	import { cn } from '$lib/utils';

	type $$Props = {
		value?: string;
		class?: string;
		type?: string;
	};

	export let value: $$Props['value'] = '';
	export let type: $$Props['type'] = 'text';
	let className: $$Props['class'] = '';
	export { className as class };
</script>

<input
	{type}
	bind:value
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
		'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
		'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
		'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed',
		'disabled:opacity-50',
		className
	)}
	{...$$restProps}
/>
```

### 3. Create Index Export

```typescript
// src/lib/components/ui/input/index.ts
export { default as Input } from './Input.svelte';
```

### 4. Use the Component

```svelte
<script>
	import { Input } from '$lib/components/ui/input';
	let email = '';
</script>

<Input type="email" bind:value={email} placeholder="Enter email" />
```

## 🎨 Working with the Dark Theme

### Accessing Theme Colors

All theme colors are available as CSS variables:

```svelte
<!-- Using Tailwind classes (recommended) -->
<div class="bg-background text-foreground">
	<p class="text-muted-foreground">Muted text</p>
	<button class="bg-primary text-primary-foreground">Primary button</button>
</div>

<!-- Or using CSS directly -->
<div style="background: hsl(var(--background))">Custom styling</div>
```

### Available Color Variables

- `--background` / `--foreground` - Main background and text
- `--primary` / `--primary-foreground` - Primary action color
- `--secondary` / `--secondary-foreground` - Secondary actions
- `--muted` / `--muted-foreground` - Muted/subtle elements
- `--accent` / `--accent-foreground` - Accent highlights
- `--destructive` / `--destructive-foreground` - Error/danger
- `--border` - Border color
- `--input` - Input border color
- `--ring` - Focus ring color

## 🔧 TypeScript Tips

### Accessing Cloudflare Bindings

```typescript
// In +page.server.ts or API routes
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	// D1 Database
	const posts = await platform.env.DB.prepare('SELECT * FROM posts').all();

	// KV Storage
	const settings = await platform.env.CACHE.get('settings', 'json');

	// Environment variables
	const token = platform.env.CF_IMAGES_TOKEN;

	return { posts, settings };
};
```

### Type-Safe Component Props

```svelte
<script lang="ts">
	// Define prop types
	type $$Props = {
		title: string;
		count?: number;
		onUpdate?: (value: number) => void;
	};

	export let title: $$Props['title'];
	export let count: $$Props['count'] = 0;
	export let onUpdate: $$Props['onUpdate'] = () => {};
</script>
```

## 📂 File Naming Conventions

```
routes/
├── +page.svelte          # Page component
├── +page.server.ts       # Server-side load function
├── +layout.svelte        # Layout component
├── +layout.server.ts     # Layout server load
├── +server.ts            # API endpoint
└── +error.svelte         # Error page

lib/
├── components/
│   └── ui/
│       └── button/
│           ├── Button.svelte    # Component
│           └── index.ts         # Export
├── server/
│   └── db/
│       └── queries.ts           # Database queries
└── utils/
    └── helpers.ts               # Utility functions
```

## 🎯 Common Patterns

### Reactive Statements

```svelte
<script>
	let count = 0;

	// Reactive derived value
	$: doubled = count * 2;

	// Reactive block (runs when count changes)
	$: {
		console.log('Count changed to:', count);
	}
</script>
```

### Two-Way Binding

```svelte
<script>
	let value = '';
</script>

<!-- Simple binding -->
<input bind:value />

<!-- Custom component binding -->
<Input bind:value />

<!-- Checkbox binding -->
<input type="checkbox" bind:checked={isActive} />
```

### Conditional Rendering

```svelte
{#if condition}
	<p>Condition is true</p>
{:else if otherCondition}
	<p>Other condition</p>
{:else}
	<p>All conditions false</p>
{/if}
```

### List Rendering

```svelte
{#each items as item, index (item.id)}
	<div>{index}: {item.name}</div>
{:else}
	<p>No items</p>
{/each}
```

## 🔍 Debugging

### Enable Source Maps

Already enabled in dev mode. Check browser DevTools → Sources.

### Check Types

```bash
npm run check
```

### View Build Output

```bash
npm run build
# Check .svelte-kit/cloudflare/ directory
```

## 📚 Useful Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn-svelte (community)](https://www.shadcn-svelte.com/)

## 🎓 Next Learning Steps

1. Create your first API route in `routes/api/`
2. Add a server load function in `+page.server.ts`
3. Build a form with validation
4. Set up D1 database locally
5. Implement authentication

---

**Happy coding!** 🚀
