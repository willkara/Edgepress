# EdgePress

A fully serverless blog platform built on Cloudflare's edge infrastructure with SvelteKit and shadcn-svelte.

## 🎨 Design System Scaffold

This is the **design foundation** for EdgePress. The scaffold includes:

- ✅ **SvelteKit** with Cloudflare adapter
- ✅ **Tailwind CSS** with dark theme as default
- ✅ **shadcn-svelte** component library (Button, Card, etc.)
- ✅ **TypeScript** with Cloudflare binding types
- ✅ **Clean, readable component architecture**

## 🏗 Architecture

For a detailed guide on how EdgePress uses Cloudflare's infrastructure (Pages, D1, KV, Images) with diagrams, please see the [Architecture Guide](ARCHITECTURE.md).

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the design scaffold in action!

## 📁 Project Structure

```
edgepress/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── ui/              # shadcn-svelte components
│   │   │       ├── button/      # Button component
│   │   │       └── card/        # Card components
│   │   ├── server/
│   │   │   ├── db/              # Database utilities (to be added)
│   │   │   ├── auth/            # Authentication (to be added)
│   │   │   └── cache/           # Caching utilities (to be added)
│   │   ├── utils/               # Utility functions
│   │   │   └── cn.ts            # Class name merging
│   │   └── types/               # TypeScript types
│   ├── routes/
│   │   ├── (public)/            # Public routes (to be added)
│   │   ├── admin/               # Admin panel (to be added)
│   │   └── api/                 # API routes (to be added)
│   ├── app.css                  # Global styles with dark theme
│   ├── app.d.ts                 # Cloudflare types
│   └── app.html                 # HTML template
├── static/                      # Static assets
├── wrangler.toml               # Cloudflare configuration
├── tailwind.config.js          # Tailwind with shadcn theme
├── svelte.config.js            # SvelteKit with CF adapter
└── package.json
```

## 🎯 What's Included

### Components (shadcn-svelte style)

All components follow the shadcn design philosophy:

- **Button**: Multiple variants (default, secondary, outline, ghost, destructive)
- **Card**: Complete card system (Card, CardHeader, CardTitle, CardDescription, CardContent)
- **Utilities**: `cn()` function for className merging

### Dark Theme

The entire app is built with a dark-first approach:

- CSS variables for theming
- Tailwind dark mode classes
- Beautiful color palette optimized for dark backgrounds

### Type Safety

Full TypeScript support with Cloudflare bindings:

```typescript
// app.d.ts includes types for:
interface Platform {
	env: {
		DB: D1Database; // D1 database
		SESSIONS: KVNamespace; // KV for sessions
		CACHE: KVNamespace; // KV for caching
		CF_IMAGES_TOKEN: string; // Environment variables
		// ... etc
	};
}
```

## 🛠️ Adding More Components

You can add more shadcn-svelte components as needed:

```bash
# Example: If you want to add an Input component
# Create: src/lib/components/ui/input/Input.svelte
# Then export it via: src/lib/components/ui/input/index.ts
```

All components follow the same pattern:

1. Use `cn()` utility for className merging
2. Accept a `class` prop for customization
3. Use Tailwind classes with CSS variables

## 📚 Design Philosophy

This scaffold follows your preferences:

- **Clean Code**: No complex abstractions, readable component structure
- **Developer-Friendly**: TypeScript autocomplete, clear file organization
- **Performant**: Svelte compiles away, minimal runtime overhead

## 🔧 Cloudflare Setup (For Later)

When you're ready to add Cloudflare services, you'll need to:

1. **Create D1 Database**:

   ```bash
   wrangler d1 create edgepress-db
   # Add the database_id to wrangler.toml
   ```

2. **Create KV Namespaces**:

   ```bash
   wrangler kv:namespace create "SESSIONS"
   wrangler kv:namespace create "CACHE"
   # Add the IDs to wrangler.toml
   ```

3. **Set Environment Variables**:
   ```bash
   wrangler secret put CF_IMAGES_TOKEN
   wrangler secret put JWT_SECRET
   ```

## 🎨 Customizing the Theme

Edit the CSS variables in `src/app.css`:

```css
.dark {
	--background: 240 10% 3.9%; /* Main background */
	--foreground: 0 0% 98%; /* Main text color */
	--primary: 217.2 91.2% 59.8%; /* Primary blue */
	/* ... customize as needed */
}
```

## 📖 Next Steps

This scaffold is the **design foundation**. Here's what comes next:

1. **Phase 1**: Database layer (D1 schema, queries)
2. **Phase 2**: Public site (post display, navigation)
3. **Phase 3**: Admin panel (markdown editor, post management)
4. **Phase 4**: Configuration & polish (settings, search)

## 💡 Development Tips

- **Hot Reload**: Changes to `.svelte` files reload instantly
- **Type Checking**: Run `npm run check` to validate TypeScript
- **Component Preview**: The homepage (`+page.svelte`) showcases all components
- **Clean Imports**: Use `$lib/` alias for clean import paths

## 🤝 Component Usage Example

```svelte
<script>
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
</script>

<Card>
	<CardHeader>
		<CardTitle>Hello EdgePress</CardTitle>
	</CardHeader>
	<CardContent>
		<p>This is how easy it is to use components!</p>
		<Button>Click Me</Button>
	</CardContent>
</Card>
```

## 📄 License

MIT

---

**Built with** ❤️ **using SvelteKit, Tailwind CSS, and Cloudflare**
