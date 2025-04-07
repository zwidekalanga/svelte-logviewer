<script module lang="ts">
	// Replace your-framework with the name of your framework
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LogViewer from '$lib/components/log-viewer/log-viewer.svelte';

	/**
	 * Svelte component that loads and views remote text in the browser lazily and efficiently.
	 * Logs can be loaded from static text, a URL, or a WebSocket and including ANSI highlighting.
	 */
	const { Story } = defineMeta({
		title: 'LogViewer',
		component: LogViewer,
		tags: ['autodocs']
	});

	type MessageData = Record<string, unknown>;
</script>

<!-- Basic example with text -->
<Story
	name="Text Based"
	args={{
		text: `\x1b[4;1mRunning "clean:all" (clean) task\x1b[0m\n\x1b[32m>> \x1b[39m0 paths cleaned.\n\n\x1b[4;1mRunning "copy:base" (copy) task\x1b[0m\nCreated 188 directories, copied 1433 files\n\n\x1b[4;1mRunning "copy:app" (copy) task\x1b[0m\nCreated 40 directories, copied 233 files\n\n\x1b[4;1mRunning "processhtml:dist" (processhtml) task\x1b[0m\n\n\x1b[4;1mRunning "ngAnnotate:dist" (ngAnnotate) task\x1b[0m\n\x1b[32m>> \x1b[39m52 files successfully generated.\n\n\x1b[4;1mRunning "uglify:dist" (uglify) task\x1b[0m\n\x1b[32m>> \x1b[39m2 sourcemaps created.\n\x1b[32m>> \x1b[39m2 files created.\n\n\x1b[4;1mRunning "less:app" (less) task\x1b[0m\n\x1b[32mFile target/dist/css/alertEvents.css created\x1b[39m\n\x1b[32mFile target/dist/css/application.css created\x1b[39m\n\n\x1b[4;1mRunning "less:libs" (less) task\x1b[0m\n\x1b[31mCreate file target/dist/css/libs.css failed\x1b[39m`,
		height: '600px'
	}}
/>

<!-- Example with URL -->
<Story
	name="URL Based"
	args={{
		url: 'https://gist.githubusercontent.com/helfi92/96d4444aa0ed46c5f9060a789d316100/raw/ba0d30a9877ea5cc23c7afcd44505dbc2bab1538/typical-live_backing.log',
		height: '600px'
	}}
/>

<!-- Example with ANSI colors -->
<Story
	name="External Mode"
	args={{
		external: true,
		text: `\x1b[4;1mRunning "clean:all" (clean) task\x1b[0m\n\x1b[32m>> \x1b[39m0 paths cleaned.\n\n\x1b[4;1mRunning "copy:base" (copy) task\x1b[0m\nCreated 188 directories, copied 1433 files\n\n\x1b[4;1mRunning "copy:app" (copy) task\x1b[0m\nCreated 40 directories, copied 233 files\n\n\x1b[4;1mRunning "processhtml:dist" (processhtml) task\x1b[0m\n\n\x1b[4;1mRunning "ngAnnotate:dist" (ngAnnotate) task\x1b[0m\n\x1b[32m>> \x1b[39m52 files successfully generated.\n\n\x1b[4;1mRunning "uglify:dist" (uglify) task\x1b[0m\n\x1b[32m>> \x1b[39m2 sourcemaps created.\n\x1b[32m>> \x1b[39m2 files created.\n\n\x1b[4;1mRunning "less:app" (less) task\x1b[0m\n\x1b[32mFile target/dist/css/alertEvents.css created\x1b[39m\n\x1b[32mFile target/dist/css/application.css created\x1b[39m\n\n\x1b[4;1mRunning "less:libs" (less) task\x1b[0m\n\x1b[31mCreate file target/dist/css/libs.css failed\x1b[39m`,
		height: '600px'
	}}
/>

<!-- Example with WebSocket -->
<Story
	name="WebSocket"
	args={{
		websocket: true,
		url: 'wss://echo.websocket.org',
		onMessage: (data: MessageData) => {
			const { bid, ask, lastPrice } = data;
			return `BTC/USD: ${bid}/${ask} Last: ${lastPrice}`;
		},
		height: '600px'
	}}
/>

<!-- Example with EventSource -->
<Story
	name="EventSource"
	args={{
		eventsource: true,
		url: 'https://stream.wikimedia.org/v2/stream/recentchange',
		eventsourceOptions: {
			withCredentials: false,
			formatMessage: (message: unknown) => {
				// Format the SSE message
				try {
					// Skip non-data messages or empty events
					if (!message || typeof message !== 'string' || message === ':ok') {
						return '';
					}

					// Try to parse JSON if it's a JSON string
					const data = JSON.parse(message);

					// Only display actual wiki changes with good data
					if (data.$schema && data.type && data.title) {
						const timestamp = new Date(data.meta?.dt || Date.now()).toISOString();
						const wiki = data.wiki || data.server_name || 'wiki';
						return `${timestamp} [${wiki}] Page "${data.title}" was ${data.type} by ${data.user || 'unknown'}`;
					}

					// For other messages, return empty string to skip them
					return '';
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (_) {
					// If parsing fails, return an empty string to skip this message
					return '';
				}
			},
			reconnect: true,
			reconnectWait: 2,
			// Limit to 50 events to see more content
			maxEvents: 1500,
			// Add a 500ms delay between events (half second)
			eventDelay: 500
		},
		follow: true,
		height: '600px'
	}}
/>

<!-- Example with Line Wrapping enabled -->
<Story
	name="Line Wrapping"
	args={{
		text: `This is a line that should be wrapped when the wrapLines option is enabled. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\nNormal short line\nAnother very long line that demonstrates the wrapping functionality in action. The text should wrap to the next line rather than extending beyond the container causing horizontal scrolling. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\nThis line includes some ANSI \x1b[31mred text\x1b[0m and \x1b[32mgreen text\x1b[0m that is very long to demonstrate that wrapping works with ANSI color codes too. The colored text should flow naturally to the next line when it reaches the edge of the container.\nThe end.`,
		wrapLines: true,
		height: '600px',
		style: {
			resize: 'both',
			overflow: 'auto',
			border: '1px solid #666'
		}
	}}
/>
