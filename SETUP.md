# EdgePress Setup Guide

## Phase 0: Foundation - CURRENT STATUS

### ✅ Completed

- [x] Scaffold extracted
- [x] Database schema created (`migrations/001_initial_schema.sql`)
- [x] Admin user seed created (`migrations/002_seed_admin.sql`)
- [x] Directory structure created
- [x] Dependencies added to package.json
- [x] TypeScript types configured

### 🔄 Next Steps

## 1. Install Dependencies

```bash
cd /home/willkara/WebstormProjects/blogger/edgepress
npm install
```

## 2. Install Wrangler CLI (if not already installed)

```bash
npm install -g wrangler

# Verify installation
wrangler --version
```

## 3. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize wrangler with your Cloudflare account.

## 4. Get Your Cloudflare Account ID

```bash
wrangler whoami
```

Save the Account ID - you'll need it for configuration.

## 5. Create D1 Databases

### Production Database

```bash
wrangler d1 create edgepress-db
```

Save the `database_id` from the output.

### Development Database

```bash
wrangler d1 create edgepress-db-dev
```

Save this `database_id` as well.

## 6. Create KV Namespaces

### SESSIONS (Production)

```bash
wrangler kv:namespace create "SESSIONS"
```

Save the namespace ID.

### SESSIONS (Development)

```bash
wrangler kv:namespace create "SESSIONS" --preview
```

Save this preview ID.

### CACHE (Production)

```bash
wrangler kv:namespace create "CACHE"
```

Save the namespace ID.

### CACHE (Development)

```bash
wrangler kv:namespace create "CACHE" --preview
```

Save this preview ID.

## 7. Enable Cloudflare Images

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to **Images** in the left sidebar
3. Click **Enable Cloudflare Images**
4. Note your Account Hash (visible in image URLs)

### Create API Token for Images

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use the **Edit Cloudflare Images** template
4. Select your account
5. Click **Continue to summary** → **Create Token**
6. **SAVE THE TOKEN** - you won't see it again!

### Configure Image Variants

In Dashboard → Images → Variants, create:

- `public` - Fit: scale-down, Quality: 85
- `hero` - Fit: cover, 1200x630, Quality: 85
- `thumbnail` - Fit: cover, 400x300, Quality: 80
- `avatar` - Fit: cover, 100x100, Quality: 80
- `og` - Fit: cover, 1200x630, Quality: 85

## 8. Configure wrangler.toml

Edit `/home/willkara/WebstormProjects/blogger/edgepress/wrangler.toml`:

```toml
name = "edgepress"
compatibility_date = "2024-11-27"
pages_build_output_dir = ".svelte-kit/cloudflare"

# Environment variables
[vars]
CF_ACCOUNT_ID = "YOUR_ACCOUNT_ID_FROM_WHOAMI"
CF_IMAGES_HASH = "YOUR_IMAGES_HASH_FROM_DASHBOARD"

# Production D1 Database
[[d1_databases]]
binding = "DB"
database_name = "edgepress-db"
database_id = "YOUR_PRODUCTION_DB_ID"

# Production KV Namespaces
[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_SESSIONS_KV_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_CACHE_KV_ID"

# Development environment
[env.development]

[[env.development.d1_databases]]
binding = "DB"
database_name = "edgepress-db-dev"
database_id = "YOUR_DEV_DB_ID"

[[env.development.kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_DEV_SESSIONS_KV_ID"

[[env.development.kv_namespaces]]
binding = "CACHE"
id = "YOUR_DEV_CACHE_KV_ID"
```

## 9. Create .dev.vars File

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and fill in:

```
# Generate JWT secret with: openssl rand -base64 32
JWT_SECRET=your-generated-secret

# From Cloudflare Dashboard
CF_IMAGES_TOKEN=your-cloudflare-images-token
CF_ACCOUNT_ID=your-account-id
CF_IMAGES_HASH=your-images-hash
```

## 10. Run Database Migrations

### Development Database (Local)

```bash
wrangler d1 execute edgepress-db-dev --file=./migrations/001_initial_schema.sql --local
wrangler d1 execute edgepress-db-dev --file=./migrations/002_seed_admin.sql --local
```

### Production Database

```bash
wrangler d1 execute edgepress-db --file=./migrations/001_initial_schema.sql
wrangler d1 execute edgepress-db --file=./migrations/002_seed_admin.sql
```

## 11. Set Production Secrets

```bash
# Set JWT Secret
wrangler secret put JWT_SECRET
# Paste your JWT secret when prompted

# Set Cloudflare Images Token
wrangler secret put CF_IMAGES_TOKEN
# Paste your Images API token when prompted
```

## 12. Test Local Development

```bash
# Start local dev server
npm run dev

# Or connect to remote Cloudflare services
npm run dev -- --remote
```

Visit http://localhost:5173 to see the scaffold running.

## Default Admin Credentials

**Email**: `admin@edgepress.local`
**Password**: `changeme123`

**⚠️ IMPORTANT**: Change this password immediately in production!

To change the password:

1. Generate a new bcrypt hash (cost factor 12)
2. Update the `users` table in your database

## Verification Checklist

- [ ] Dependencies installed (`npm install` completed)
- [ ] Wrangler CLI installed and logged in
- [ ] D1 databases created (dev + prod)
- [ ] KV namespaces created (dev + prod)
- [ ] Cloudflare Images enabled
- [ ] API token created for Images
- [ ] Image variants configured
- [ ] wrangler.toml updated with all IDs
- [ ] .dev.vars created with secrets
- [ ] Database migrations run (dev + prod)
- [ ] Production secrets set
- [ ] Local dev server runs successfully

## Next Phase

Once all verification steps are complete, you're ready for **Phase 1: End-to-End MVP**!

See `/home/willkara/.claude/plans/serialized-humming-cocoa.md` for the full implementation plan.

## Useful Commands

```bash
# Development
npm run dev              # Local dev server
npm run dev -- --remote  # Dev server with Cloudflare bindings
npm run build            # Build for production
npm run check            # Type checking

# Wrangler
wrangler d1 list                                    # List databases
wrangler d1 execute DB_NAME --command="SELECT 1"    # Run SQL
wrangler kv:namespace list                          # List KV namespaces
wrangler secret list                                # List secrets
wrangler pages deploy .svelte-kit/cloudflare        # Deploy

# Database
wrangler d1 execute edgepress-db-dev --command="SELECT * FROM users" --local
wrangler d1 backup create edgepress-db
```

## Troubleshooting

**"Database not found"**

- Verify database_id in wrangler.toml matches output from `wrangler d1 create`

**"Unauthorized" errors**

- Check secrets with `wrangler secret list`
- Verify API token has correct permissions

**Build fails**

- Run `npm install` again
- Check Node.js version (should be 18+)

**Can't access .dev.vars locally**

- Ensure file is named exactly `.dev.vars`
- Restart dev server after creating the file
