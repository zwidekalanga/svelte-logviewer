import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['tests/unit/**/*.{test,spec}.ts', 'tests/package-integration/**/*.{test,spec}.ts'],
		globals: true,
		environment: 'jsdom',
		testTimeout: 10000,
		silent: false,
		reporters: ['default'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'lcov', 'html'],
			reportsDirectory: './coverage',
			include: ['src/**/*'],
			exclude: [
				'**/*.config.{js,ts}',
				'**/node_modules/**',
				'**/dist/**',
				'**/.svelte-kit/**',
				'**/*.test.*',
				'**/*.spec.*',
				'**/__tests__/**',
				'**/.storybook/**',
				'**/stories/**',
				'**/tests/**'
			]
		},
		typecheck: {
			tsconfig: './tsconfig.test.json'
		}
	}
});
