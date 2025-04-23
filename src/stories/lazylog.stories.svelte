<script module lang="ts">
	// Replace your-framework with the name of your framework
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import LazyLog from '$lib/components/lazylog/lazylog.svelte';

	/**
	 * Svelte component that loads and views remote text in the browser lazily and efficiently.
	 * Logs can be loaded from static text, a URL, or a WebSocket and including ANSI highlighting.
	 */
	const { Story } = defineMeta({
		title: 'LazyLog',
		component: LazyLog,
		tags: ['autodocs']
	});
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

<!-- Example with WebSocket - Using Binance WebSocket API for real-time cryptocurrency trade data -->
<Story
	name="WebSocket"
	args={{
		websocket: true,
		url: 'wss://stream.binance.com:9443/ws/btcusdt@trade', // Binance WebSocket API - real-time BTC/USDT trade data
		websocketOptions: {
			// No need for onOpen handler as the service automatically sends data
			// Format the messages to look nice in the log viewer
			formatMessage: (message: unknown) => {
				try {
					if (typeof message === 'string') {
						// Try to parse as JSON
						const data = JSON.parse(message);

						// Format Binance trade data
						if (data.e === 'trade') {
							const symbol = data.s; // Trading pair symbol (e.g., BTCUSDT)
							const price = Number(data.p).toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							});
							const quantity = Number(data.q).toLocaleString('en-US', {
								minimumFractionDigits: 8,
								maximumFractionDigits: 8
							});
							const timestamp = new Date(data.T).toLocaleTimeString(); // Trade time
							const isBuyerMaker = data.m ? 'SELL' : 'BUY'; // Market side
							const color = isBuyerMaker === 'SELL' ? '\x1b[31m' : '\x1b[32m'; // Red for sell, green for buy

							return `[${timestamp}] [TRADE] ${symbol} | ${color}${isBuyerMaker}\x1b[0m | Price: $${price} | Quantity: ${quantity}`;
						}

						return JSON.stringify(data, null, 2);
					}
					return String(message);
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (_) {
					return String(message);
				}
			},
			reconnect: true
		},
		follow: true, // Auto-scroll to follow new log entries
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

					// For other messages, return an empty string to skip them
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
		text: `[vcs 2018-11-14T21:13:38.469Z] PERFHERDER_DATA: {"framework": {"name": "vcs"}, "suites": [{"extraOptions": ["m3.xlarge"], "lowerIsBetter": true, "name": "clone", "shouldAlert": false, "subtests": [], "value": 156.62339401245117}, {"extraOptions": ["m3.xlarge"], "lowerIsBetter": true, "name": "pull", "shouldAlert": false, "subtests": [], "value": 13.032690048217773}, {"extraOptions": ["m3.xlarge"], "lowerIsBetter": true, "name": "update", "shouldAlert": false, "subtests": [], "value": 98.61538600921631}, {"extraOptions": ["m3.xlarge"], "lowerIsBetter": true, "name": "overall", "shouldAlert": false, "subtests": [], "value": 270.7935130596161}]}`,
		wrapLines: true,
		height: '600px',
		style: {
			resize: 'both',
			overflow: 'auto',
			border: '1px solid #666'
		}
	}}
/>
