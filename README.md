# Svelte LogViewer

A Svelte component for displaying and streaming log files with syntax highlighting, search functionality, and more.

## Features

- Display log data with syntax highlighting
- Real-time log streaming via WebSockets or EventSource
- Virtual scrolling for optimal performance with large logs
- Search functionality with case sensitivity option
- Line highlighting and line numbers
- Follow mode to auto-scroll to new log entries
- Compatible with both Svelte 4 and Svelte 5

## Installation

```bash
npm install @zwidekalanga/svelte-logviewer
```

or

```bash
yarn add @zwidekalanga/svelte-logviewer
```

## Usage

### Basic Usage

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';
</script>

<LogViewer
	text="This is a sample log text\nWith multiple lines\nAnd more content"
	height="400px"
	enableLineNumbers={true}
	enableSearch={true}
/>
```

### Streaming Logs via WebSocket

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';
</script>

<LogViewer
	url="wss://api.example.com/logs/stream"
	websocket={true}
	follow={true}
	height="600px"
	enableSearch={true}
/>
```

### Streaming Logs via EventSource

```svelte
<script>
	import { LogViewer } from '@zwidekalanga/svelte-logviewer';
</script>

<LogViewer
	url="https://api.example.com/logs/stream"
	eventsource={true}
	follow={true}
	height="600px"
	enableSearch={true}
/>
```

## Props

| Prop               | Type            | Default   | Description                                         |
| ------------------ | --------------- | --------- | --------------------------------------------------- |
| text               | string          | undefined | String containing log text to display               |
| url                | string          | undefined | URL from which to fetch log content                 |
| height             | string/number   | 'auto'    | Height of the component                             |
| width              | string/number   | 'auto'    | Width of the component                              |
| enableSearch       | boolean         | false     | Enable the search functionality                     |
| enableLineNumbers  | boolean         | true      | Show line numbers                                   |
| caseInsensitive    | boolean         | false     | Enable case insensitive search                      |
| follow             | boolean         | false     | Auto-scroll to the bottom when new content is added |
| websocket          | boolean         | false     | Specify that URL is a WebSocket URL                 |
| eventsource        | boolean         | false     | Specify that URL is an EventSource URL              |
| websocketOptions   | object          | {}        | Configuration options for WebSocket connection      |
| eventsourceOptions | object          | {}        | Configuration options for EventSource connection    |
| highlight          | number/number[] | []        | Line number(s) to highlight                         |

For a full list of props, see the type definitions in the source code.

## Development

### Testing

The package includes several test suites:

```bash
# Run unit tests
yarn test:unit

# Run end-to-end tests
yarn test:e2e

# Run package structure tests
yarn test:package

# Run all tests
yarn test
```

The package structure tests verify that the library can be properly imported by consumer projects.

## Examples

Check out the examples in the Storybook:

```bash
# Run storybook locally
yarn storybook
```

## Browser Support

Supports all modern browsers including:

- Chrome
- Firefox
- Safari
- Edge

## TypeScript Support

This library includes TypeScript type definitions for all components and props.

```typescript
import { LogViewer } from '@zwidekalanga/svelte-logviewer';
import type { LogViewerProps } from '@zwidekalanga/svelte-logviewer';

const props: LogViewerProps = {
	text: 'Sample log content',
	enableSearch: true
};
```

## License

MIT
