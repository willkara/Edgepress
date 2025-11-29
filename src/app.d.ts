// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}

		interface Locals {
			user?: {
				id: string;
				email: string;
				display_name: string;
			};
			requestId?: string;
			envOk?: boolean;
		}

		// interface PageData {}
		// interface PageState {}

		interface Platform {
			env: {
				DB: D1Database;
				SESSIONS: KVNamespace;
				CACHE: KVNamespace;
				CF_IMAGES_TOKEN: string;
				CF_ACCOUNT_ID: string;
				CF_IMAGES_HASH: string;
				JWT_SECRET: string;
			};
			context: ExecutionContext;
			caches: CacheStorage;
		}
	}
}

export {};
