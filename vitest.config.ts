import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['tests/unit/**/*.{test,spec}.ts'],
		globals: true,
		environment: 'jsdom',
		testTimeout: 10000,
		silent: false,
		reporters: ['default']
	}
});
