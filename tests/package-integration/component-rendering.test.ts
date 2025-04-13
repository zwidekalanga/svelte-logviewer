import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import MockConsumer from './MockConsumer.svelte';

// Skip rendering tests for now since they require a browser environment
describe.skip('LogViewer component rendering', () => {
	it('should render the component when imported', () => {
		const { container } = render(MockConsumer, {
			props: {
				sampleText: 'Test line 1\nTest line 2\nTest line 3'
			}
		});

		// Verify the component rendered
		expect(container.querySelector('.log-viewer')).not.toBeNull();

		// Verify search bar is present
		expect(container.querySelector('input[type="text"]')).not.toBeNull();

		// Check if the lines are rendered (VList should have rendered the lines)
		const content = container.querySelector('.svelte-lazylog-content');
		expect(content).not.toBeNull();
	});

	it('should apply custom props correctly', () => {
		const { container } = render(MockConsumer, {
			props: {
				sampleText: 'Custom prop test',
				props: {
					height: '300px',
					caseInsensitive: true,
					enableLineNumbers: false
				}
			}
		});

		// Check if height is applied
		const logViewer = container.querySelector('.log-viewer');
		expect(logViewer).not.toBeNull();
		expect(logViewer?.getAttribute('style')).toContain('height: 300px');
	});
});
