import type { ComponentType } from 'svelte';

/**
 * Common options shared between WebSocket and EventSource connections
 */
export interface CommonConnectionOptions {
	/**
	 * Callback when the connection has an error
	 */
	onError?: ((e: Event) => void) | undefined;
	/**
	 * Callback which formats the data stream message.
	 */
	formatMessage?: ((message: unknown) => string) | undefined;
	/**
	 * Set to true, to reconnect automatically.
	 */
	reconnect?: boolean;
	/**
	 * Set the time to wait between reconnects in seconds.
	 * Default is 1s
	 */
	reconnectWait?: number;
}

export interface WebsocketOptions extends CommonConnectionOptions {
	/**
	 * Callback when the socket is opened
	 */
	onOpen?: ((e: Event, socket: WebSocket) => void) | undefined;
	/**
	 * Callback when the socket is closed
	 */
	onClose?: ((e: CloseEvent) => void) | undefined;
}

export interface EventSourceOptions extends CommonConnectionOptions {
	/**
	 * Boolean indicating if CORS should be set to include credentials
	 */
	withCredentials?: boolean;
	/**
	 * Callback when the eventsource is opened
	 */
	onOpen?: ((e: Event, eventSource: EventSource) => void) | undefined;
	/**
	 * Callback when the eventsource is closed
	 */
	onClose?: ((e: Event) => void) | undefined;
	/**
	 * Maximum number of events to process before closing the connection.
	 * When undefined, all events will be processed.
	 */
	maxEvents?: number;
	/**
	 * Delay in milliseconds between processing events.
	 * When undefined, events are processed as they arrive.
	 */
	eventDelay?: number;
	/**
	 * Maximum number of consecutive empty events before disconnecting.
	 * This prevents browser crashes when receiving too many empty events.
	 * Default is 100.
	 */
	maxEmptyEvents?: number;
}

export interface LazyLogProps {
	/**
	 * Flag to enable/disable case insensitive search
	 */
	caseInsensitive?: boolean;
	/**
	 * Optional custom inline style to attach to element which contains
	 * the interior scrolling container.
	 */
	containerStyle?: Record<string, string | number>;
	/**
	 * If true, capture system hotkeys for searching the page (Cmd-F, Ctrl-F,
	 * etc.)
	 */
	enableHotKeys?: boolean;
	/**
	 * Enable the line gutters to be displayed. Default is false
	 */
	enableGutters?: boolean;
	/**
	 * Enable the line numbers to be displayed. Default is true.
	 */
	enableLineNumbers?: boolean;
	/**
	 * Enable hyperlinks to be discovered in log text and made clickable links. Default is false.
	 */
	enableLinks?: boolean;
	/**
	 * Enable the search feature.
	 */
	enableSearch?: boolean;
	/**
	 * If true, search like a browser search - enter jumps to the next line
	 * with the searched term, shift + enter goes backwards.
	 * Also adds up and down arrows to search bar to jump
	 * to the next and previous result.
	 * If false, enter toggles the filter instead.
	 * Defaults to true.
	 */
	enableSearchNavigation?: boolean;
	/**
	 * Enable the ability to select multiple lines using shift + click.
	 * Defaults to true.
	 */
	enableMultilineHighlight?: boolean;
	/**
	 * Number of extra lines to show at the bottom of the log.
	 * Set this to 1 so that Linux users can see the last line
	 * of the log output.
	 */
	extraLines?: number;
	/**
	 * Options object which will be passed through to the `fetch` request.
	 * Defaults to `{ credentials: 'omit' }`.
	 */
	fetchOptions?: RequestInit;
	/**
	 * Scroll to the end of the component after each update to the content.
	 * Cannot be used in combination with `scrollToLine`.
	 */
	follow?: boolean;
	/**
	 * Execute a function against each string part of a line,
	 * returning a new line part. Is passed a single argument which is
	 * the string part to manipulate, should return a new string
	 * with the manipulation completed.
	 */
	formatPart?: (text: string) => string;
	/**
	 * The Line Gutter component
	 */
	gutter?: ComponentType;
	/**
	 * Set the height in pixels for the component.
	 * Defaults to `'auto'` if unspecified. When the `height` is `'auto'`,
	 * the component will expand vertically to fill its container.
	 */
	height?: string | number;
	/**
	 * Line number (e.g. `highlight={10}`) or line number range to highlight
	 * inclusively (e.g. `highlight={[5, 10]}` highlights lines 5-10).
	 * This is 1-indexed, i.e. line numbers start at `1`.
	 */
	highlight?: number | number[];
	/**
	 * Specify an additional className to append to highlighted lines.
	 */
	highlightLineClassName?: string;
	/**
	 * Specify an additional className to append to lines.
	 */
	lineClassName?: string;
	/**
	 * Execute a function if the provided `url` has encountered an error
	 * during loading.
	 */
	onError?: (error: unknown) => unknown;
	/**
	 * Execute a function when the highlighted range has changed.
	 * Is passed a single argument which is an `Immutable.Range`
	 * of the highlighted line numbers.
	 */
	onHighlight?: (range: number | number[]) => unknown;
	/**
	 * Execute a function if/when the provided `url` has completed loading.
	 */
	onLoad?: () => unknown;
	/**
	 * Callback to invoke on user scroll. Args matches the ScrollFollow onScroll callback.
	 * @param args
	 */
	onScroll?(args: { scrollTop: number; scrollHeight: number; clientHeight: number }): void;
	/**
	 * Number of rows to render above/below the visible bounds of the list.
	 * This can help reduce flickering during scrolling on
	 * certain browsers/devices. Defaults to `100`.
	 */
	overscanRowCount?: number;
	/**
	 * A fixed row height in pixels. Controls how tall a line is,
	 * as well as the `lineHeight` style of the line's text.
	 * Defaults to `19`.
	 */
	rowHeight?: number;
	/**
	 * Scroll to a particular line number once it has loaded.
	 * This is 1-indexed, i.e. line numbers start at `1`.
	 * Cannot be used in combination with `follow`.
	 */
	scrollToLine?: number;
	/**
	 * Minimum number of characters to trigger a search. Defaults to 2.
	 */
	searchMinCharacters?: number;
	/**
	 * Make the text selectable, allowing to copy & paste. Defaults to `false`.
	 */
	selectableLines?: boolean;
	/**
	 * Set to `true` to specify remote URL will be streaming chunked data.
	 * Defaults to `false` to download data until completion.
	 */
	stream?: boolean;
	/**
	 * Optional custom inline style to attach to root
	 * virtual `LazyList` element.
	 */
	style?: Record<string, string | number>;
	/**
	 * String containing text to display.
	 */
	text?: string;
	/**
	 * The URL from which to fetch content. Subject to same-origin policy,
	 * so must be accessible via fetch on same domain or via CORS.
	 */
	url?: string;
	/**
	 * Set to `true` to specify that url is a websocket URL.
	 * Defaults to `false` to download data until completion.
	 */
	websocket?: boolean;
	/**
	 * Options object which will be passed through to websocket.
	 */
	websocketOptions?: WebsocketOptions;
	/**
	 * Set to `true` to specify that url is an eventsource URL.
	 * Defaults to `false` to download data until completion.
	 */
	eventsource?: boolean;
	/**
	 * Options object which will be passed through to evensource.
	 */
	eventsourceOptions?: EventSourceOptions;
	/**
	 * Set the width in pixels for the component.
	 * Defaults to `'auto'` if unspecified.
	 * When the `width` is `'auto'`, the component will expand
	 * horizontally to fill its container.
	 */
	width?: string | number;
	/**
	 * Wrap overflowing lines. Default is false
	 */
	wrapLines?: boolean;
	/**
	 * Set to `true` to specify that parent component will be calling `appendLines` to update data.
	 * Parent component should hold a ref (with `useRef` or `createRef`) to the `LazyLog` component.
	 * Defaults to `false`.
	 */
	external?: boolean;
}
