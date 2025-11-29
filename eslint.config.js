import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Ignore patterns
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'dist/**',
			'node_modules/**',
			'.wrangler/**',
			'*.cjs',
			'*.config.js',
			'src/lib/components/edra/**'
		]
	},

	// Base JavaScript/TypeScript configuration
	{
		files: ['**/*.js', '**/*.ts'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021,
				// Cloudflare Workers types
				D1Database: 'readonly',
				KVNamespace: 'readonly',
				ExecutionContext: 'readonly',
				Request: 'readonly',
				Response: 'readonly',
				FormData: 'readonly',
				Headers: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			...js.configs.recommended.rules,
			...ts.configs['recommended'].rules,
			...ts.configs['recommended-requiring-type-checking'].rules,

			// Microsoft TypeScript standards
			'@typescript-eslint/explicit-function-return-type': [
				'warn',
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
					allowHigherOrderFunctions: true
				}
			],
			'@typescript-eslint/explicit-module-boundary-types': 'warn',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'@typescript-eslint/prefer-optional-chain': 'warn',
			'@typescript-eslint/strict-boolean-expressions': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					selector: 'interface',
					format: ['PascalCase']
				},
				{
					selector: 'typeAlias',
					format: ['PascalCase']
				},
				{
					selector: 'enum',
					format: ['PascalCase']
				}
			],

			// Code quality
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'prefer-const': 'error',
			'no-var': 'error',
			eqeqeq: ['error', 'always'],
			curly: ['error', 'all']
		}
	},

	// Svelte-specific configuration
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				project: './tsconfig.json',
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser,
				// Cloudflare Workers types
				D1Database: 'readonly',
				KVNamespace: 'readonly',
				ExecutionContext: 'readonly'
			}
		},
		plugins: {
			svelte,
			'@typescript-eslint': ts
		},
		rules: {
			...svelte.configs.recommended.rules,
			...svelte.configs.prettier.rules,

			// Svelte-specific rules
			'svelte/no-at-html-tags': 'error',
			'svelte/no-target-blank': 'error',
			'svelte/no-dupe-else-if-blocks': 'error',
			'svelte/no-unused-svelte-ignore': 'warn',
			'svelte/require-store-reactive-access': 'warn',
			'svelte/valid-compile': 'error',

			// TypeScript rules for Svelte
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_|^\\$\\$(Props|Events|Slots|Generic)'
				}
			]
		}
	},

	// Server-side files (additional Node.js rules)
	{
		files: ['**/*.server.ts', '**/hooks.server.ts', '**/+server.ts'],
		languageOptions: {
			globals: {
				...globals.node
			}
		},
		rules: {
			'no-console': 'off', // Allow console in server files
			'@typescript-eslint/only-throw-error': 'off' // Allow SvelteKit error() helper
		}
	},

	// Relax rules for external-ish edra components to avoid noisy lint failures
	{
		files: ['src/lib/components/edra/**/*.{ts,svelte}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/prefer-optional-chain': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			eqeqeq: 'off',
			'svelte/no-target-blank': 'off'
		}
	},

	// Relax DB layer rules (lots of dynamic SQL shapes)
	{
		files: ['src/lib/server/db/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/prefer-optional-chain': 'off',
			eqeqeq: 'off'
		}
	}
];
