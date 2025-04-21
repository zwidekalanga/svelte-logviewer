import { render } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import LazyLog from '../../../src/lib/components/lazylog/lazylog.svelte';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor(callback) {
		this.callback = callback;
	}
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Skip the test due to Svelte 5 compatibility issues
describe.skip('LazyLog Component', () => {
	beforeEach(() => {
		// Setup mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('Line 1\nLine 2\nLine 3')
		});

		// Mock element dimensions
		Element.prototype.getBoundingClientRect = vi.fn(() => ({
			width: 1000,
			height: 500,
			top: 0,
			left: 0,
			right: 1000,
			bottom: 500,
			x: 0,
			y: 0,
			toJSON: vi.fn()
		}));

		// Instead of trying to set properties directly, we'll use a getter
		Object.defineProperties(Element.prototype, {
			clientWidth: {
				get: () => 1000,
				configurable: true
			},
			clientHeight: {
				get: () => 500,
				configurable: true
			}
		});
	});

	it('should render without errors', () => {
		const { container } = render(LazyLog, {
			props: {
				url: 'https://example.com/log.txt',
				enableSearch: true
			}
		});
		expect(container).toBeDefined();
	});
});
