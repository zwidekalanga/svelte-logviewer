# Svelte LogViewer

A powerful Svelte component for loading and viewing log files and text streams in the browser. The LogViewer component can load content from static text, URLs, WebSockets, or EventSource connections and supports ANSI color highlighting.

## Installation

```bash
# npm
npm install @zwidekalanga/svelte-logviewer

# pnpm
pnpm add @zwidekalanga/svelte-logviewer

# yarn
yarn add @zwidekalanga/svelte-logviewer
```

## Basic Usage

Import and use the LogViewer component in your Svelte application:

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';
</script>

<LogViewer text="Your log text here..." height="400px" />
```

## Use Cases

### Display Static Text with ANSI Colors

For displaying log text with ANSI color codes that you already have in your application:

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';

	const logText = `\x1b[4;1mRunning "clean:all" (clean) task\x1b[0m\n\x1b[32m>> \x1b[39m0 paths cleaned.`;
</script>

<LogViewer text={logText} height="600px" />
```

### Load Logs from a URL

Load and display logs from a remote URL:

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';
</script>

<LogViewer url="https://example.com/path/to/your/log-file.log" height="600px" />
```

### External Mode

Use external mode when you plan to programmatically append content to the log viewer:

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';
	import { onMount } from 'svelte';

	let logViewer;

	onMount(() => {
		// You can later append content programmatically
		// logViewer.appendLines("New log content...");
	});
</script>

<LogViewer bind:this={logViewer} external={true} text="Initial log content..." height="600px" />
```

### WebSocket Connection

Connect to a WebSocket stream to display real-time logs:

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';

	const onMessage = (data) => {
		const { bid, ask, lastPrice } = data;
		return `BTC/USD: ${bid}/${ask} Last: ${lastPrice}`;
	};
</script>

<LogViewer websocket={true} url="wss://your-websocket-endpoint" {onMessage} height="600px" />
```

### EventSource (Server-Sent Events)

Connect to an SSE endpoint for streaming logs:

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';
</script>

<LogViewer
	eventsource={true}
	url="https://your-eventsource-endpoint"
	eventsourceOptions={{
		withCredentials: false,
		formatMessage: (message) => {
			// Format or filter the message as needed
			try {
				const data = JSON.parse(message);
				return `${new Date().toISOString()} - ${data.message}`;
			} catch (_) {
				return message;
			}
		},
		reconnect: true,
		maxEvents: 1000
	}}
	follow={true}
	height="600px"
/>
```

## Props

The LogViewer component accepts the following props:

| Prop                | Type           | Default  | Description                                   |
| ------------------- | -------------- | -------- | --------------------------------------------- |
| `text`              | string         | `''`     | Static text content to display                |
| `url`               | string         | `''`     | URL to fetch log content from                 |
| `height`            | string\|number | `'auto'` | Height of the component                       |
| `width`             | string\|number | `'auto'` | Width of the component                        |
| `websocket`         | boolean        | `false`  | Set to true when using WebSocket connection   |
| `eventsource`       | boolean        | `false`  | Set to true when using EventSource connection |
| `follow`            | boolean        | `false`  | Auto-scroll to the latest content             |
| `external`          | boolean        | `false`  | Enable appending content programmatically     |
| `enableSearch`      | boolean        | `true`   | Show search functionality                     |
| `enableLineNumbers` | boolean        | `true`   | Show line numbers                             |
| `caseInsensitive`   | boolean        | `false`  | Case insensitive search                       |

For a complete list of all available props and their descriptions, please refer to the [TypeScript definitions](src/types/log-viewer.d.ts).

## License

MIT
