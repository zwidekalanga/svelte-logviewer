<script module>
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
		onMessage: (data) => {
			const { bid, ask, lastPrice } = data;
			return `BTC/USD: ${bid}/${ask} Last: ${lastPrice}`;
		},
		height: '600px'
	}}
/>