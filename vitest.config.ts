import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['run-tests/unit/**/*.{test,spec}.ts'],
		globals: true,
		environment: 'jsdom'
	}
});
