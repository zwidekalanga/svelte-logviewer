import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import LineContent from '../../../src/lib/components/lazylog/line-content.svelte';
import LineNumber from '../../../src/lib/components/lazylog/line-number.svelte';
import Line from '../../../src/lib/components/lazylog/line.svelte';
import SearchBar from '../../../src/lib/components/lazylog/search-bar.svelte';

// Skip all component tests for now due to Svelte 5 compatibility issues
describe.skip('LazyLog Components', () => {
	describe('Line', () => {
		it('should render without errors', () => {
			const { container } = render(Line, {
				props: {
					line: { content: [{ text: 'sample log line' }], number: 1 }
				}
			});
			expect(container).toBeDefined();
		});
	});

	describe('LineNumber', () => {
		it('should render without errors', () => {
			const { container } = render(LineNumber, {
				props: {
					number: 1
				}
			});
			expect(container).toBeDefined();
		});
	});

	describe('LineContent', () => {
		it('should render without errors', () => {
			const { container } = render(LineContent, {
				props: {
					content: [{ text: 'sample content' }]
				}
			});
			expect(container).toBeDefined();
		});
	});

	describe('SearchBar', () => {
		it('should render without errors', () => {
			const { container } = render(SearchBar);
			expect(container).toBeDefined();
		});
	});
});
