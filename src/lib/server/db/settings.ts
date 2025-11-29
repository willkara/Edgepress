import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Setting {
	key: string;
	value: string;
	updated_at: string;
}

export interface SettingsGroup {
	general: {
		site_title: string;
		site_description: string;
		site_tagline: string;
	};
	author: {
		author_name: string;
		author_bio: string;
		author_email: string;
	};
	social: {
		twitter_url: string;
		github_url: string;
		linkedin_url: string;
	};
	seo: {
		meta_title_suffix: string;
		meta_description_default: string;
		og_image_url: string;
	};
}

// Default values for settings
const DEFAULTS: SettingsGroup = {
	general: {
		site_title: 'EdgePress',
		site_description: 'A modern blog platform',
		site_tagline: ''
	},
	author: {
		author_name: '',
		author_bio: '',
		author_email: ''
	},
	social: {
		twitter_url: '',
		github_url: '',
		linkedin_url: ''
	},
	seo: {
		meta_title_suffix: ' | EdgePress',
		meta_description_default: '',
		og_image_url: ''
	}
};

/**
 * Get a single setting by key
 */
export async function getSetting(db: D1Database, key: string): Promise<string | null> {
	const query = 'SELECT value FROM settings WHERE key = ? LIMIT 1';
	const result = await db.prepare(query).bind(key).first<{ value: string }>();
	return result?.value || null;
}

/**
 * Get all settings grouped by category with defaults
 */
export async function getSettingsGroup(db: D1Database): Promise<SettingsGroup> {
	const query = 'SELECT key, value FROM settings';
	const result = await db.prepare(query).all<Setting>();

	const settings = result.results || [];

	// Create a map of key-value pairs from database
	const settingsMap: Record<string, string> = {};
	for (const setting of settings) {
		settingsMap[setting.key] = setting.value;
	}

	// Build SettingsGroup with defaults for missing values
	return {
		general: {
			site_title: settingsMap.site_title || DEFAULTS.general.site_title,
			site_description: settingsMap.site_description || DEFAULTS.general.site_description,
			site_tagline: settingsMap.site_tagline || DEFAULTS.general.site_tagline
		},
		author: {
			author_name: settingsMap.author_name || DEFAULTS.author.author_name,
			author_bio: settingsMap.author_bio || DEFAULTS.author.author_bio,
			author_email: settingsMap.author_email || DEFAULTS.author.author_email
		},
		social: {
			twitter_url: settingsMap.twitter_url || DEFAULTS.social.twitter_url,
			github_url: settingsMap.github_url || DEFAULTS.social.github_url,
			linkedin_url: settingsMap.linkedin_url || DEFAULTS.social.linkedin_url
		},
		seo: {
			meta_title_suffix: settingsMap.meta_title_suffix || DEFAULTS.seo.meta_title_suffix,
			meta_description_default:
				settingsMap.meta_description_default || DEFAULTS.seo.meta_description_default,
			og_image_url: settingsMap.og_image_url || DEFAULTS.seo.og_image_url
		}
	};
}

/**
 * Set or update a single setting (UPSERT)
 */
export async function setSetting(db: D1Database, key: string, value: string): Promise<void> {
	const query = `
		INSERT INTO settings (key, value, updated_at)
		VALUES (?, ?, datetime('now'))
		ON CONFLICT(key) DO UPDATE SET
			value = excluded.value,
			updated_at = datetime('now')
	`;

	await db.prepare(query).bind(key, value).run();
}

/**
 * Batch update multiple settings atomically
 */
export async function setMultipleSettings(
	db: D1Database,
	settings: Record<string, string>
): Promise<void> {
	// Use D1 batch operation for atomic updates
	const statements = Object.entries(settings).map(([key, value]) => {
		return db
			.prepare(
				`INSERT INTO settings (key, value, updated_at)
				 VALUES (?, ?, datetime('now'))
				 ON CONFLICT(key) DO UPDATE SET
					value = excluded.value,
					updated_at = datetime('now')`
			)
			.bind(key, value);
	});

	await db.batch(statements);
}

/**
 * Initialize default settings in the database
 */
export async function initializeDefaultSettings(db: D1Database): Promise<void> {
	const defaultSettings: Record<string, string> = {
		site_title: DEFAULTS.general.site_title,
		site_description: DEFAULTS.general.site_description,
		site_tagline: DEFAULTS.general.site_tagline,
		author_name: DEFAULTS.author.author_name,
		author_bio: DEFAULTS.author.author_bio,
		author_email: DEFAULTS.author.author_email,
		twitter_url: DEFAULTS.social.twitter_url,
		github_url: DEFAULTS.social.github_url,
		linkedin_url: DEFAULTS.social.linkedin_url,
		meta_title_suffix: DEFAULTS.seo.meta_title_suffix,
		meta_description_default: DEFAULTS.seo.meta_description_default,
		og_image_url: DEFAULTS.seo.og_image_url
	};

	await setMultipleSettings(db, defaultSettings);
}

/**
 * Get all settings with caching
 * TTL: 3600 seconds (1 hour) - settings rarely change
 */
export async function getSettingsGroupCached(
	db: D1Database,
	cache: KVNamespace
): Promise<SettingsGroup> {
	const { getCached, setCached } = await import('$lib/server/cache/cache');
	const cacheKey = 'settings:all';

	// Try cache first
	const cached = await getCached<SettingsGroup>(cache, cacheKey);
	if (cached) {
		return cached;
	}

	// Cache miss - fetch from D1
	const settings = await getSettingsGroup(db);

	// Store in cache for 1 hour
	await setCached(cache, cacheKey, settings, 3600);

	return settings;
}
