<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { VList } from 'virtua/svelte';

	import {
		DEFAULT_PROPS,
		processText,
		isHighlighted,
		findMatches,
		getMatchesForLine,
		getActiveMatchForLine,
		getNextMatchIndex,
		getPreviousMatchIndex,
		type Match
	} from './lazylog-utils.js';
	import Line from './line.svelte';
	import SearchBar from './search-bar.svelte';

	import type { LazyLogProps } from '$lib/types/lazylog.js';
	import type { LogLine } from '$lib/types/log-line.js';
	import type { SvelteComponent } from 'svelte';

	import { EventSourceClient, WebSocketClient } from '$lib/utils/connection/index.js';

	const props = $props();

	const {
		containerStyle,
		caseInsensitive,
		height,
		width,
		style,
		highlight,
		url,
		text,
		stream,
		...restProps
	}: LazyLogProps = {
		...DEFAULT_PROPS,
		...props
	};

	let lines = $state<LogLine[]>([]);
	let virtualContainer: SvelteComponent;
	let wsClient: WebSocketClient | null = null;
	let esClient: EventSourceClient | null = null;

	// Search state
	let searchText = $state('');
	let currentCaseInsensitive = $state(caseInsensitive);
	let matches = $state<Match[]>([]);
	let currentMatchIndex = $state(-1);

	// Apply default values
	const wrapLines = restProps.wrapLines ?? DEFAULT_PROPS.wrapLines;

	let containerWidth = 0;
	let characterWidth = 8.4; // Approximate width of a character in Monaco font
	let containerElement: HTMLElement | null = null;
	let resizeObserver: ResizeObserver | null = null;

	// Calculate max characters that can fit in the container
	function getMaxLineLength(): number {
		if (containerWidth === 0) return 100; // Default fallback
		return Math.floor(containerWidth / characterWidth);
	}

	function handleSearch(detail: { value: string; caseInsensitive: boolean }) {
		if (!detail) {
			return;
		}

		searchText = detail.value;
		currentCaseInsensitive = !!detail.caseInsensitive;

		// Since the SearchBar component now only dispatches when criteria are met,
		// we don't need to check the minimum character count here
		matches = findMatches(
			lines,
			searchText,
			Boolean(currentCaseInsensitive),
			restProps.searchMinCharacters ?? 3
		);

		// Set current match to first match, if any
		currentMatchIndex = matches.length > 0 ? 0 : -1;

		// Scroll to first match if found
		if (currentMatchIndex >= 0) {
			scrollToMatch();
		}
	}

	function handleNextResult() {
		currentMatchIndex = getNextMatchIndex(currentMatchIndex, matches.length);
		scrollToMatch();
	}

	function handlePreviousResult() {
		currentMatchIndex = getPreviousMatchIndex(currentMatchIndex, matches.length);
		scrollToMatch();
	}

	function scrollToMatch() {
		if (currentMatchIndex >= 0 && virtualContainer && matches.length > 0) {
			const match = matches[currentMatchIndex];

			// Find the index of the line in the array
			const lineIndex = lines.findIndex((line) => line.number === match.lineNumber);

			if (lineIndex !== -1) {
				if (typeof virtualContainer.scrollToIndex === 'function') {
					virtualContainer.scrollToIndex(lineIndex);
				}
			}
		}
	}

	function isLineHighlighted(lineNumber: number): boolean {
		// Only check if line is explicitly highlighted by props, not by search
		return isHighlighted(lineNumber, highlight ?? []);
	}

	function isActiveMatchLine(lineNumber: number): boolean {
		// Check if this line contains the active match
		return (
			currentMatchIndex >= 0 &&
			matches[currentMatchIndex]?.lineNumber === lineNumber &&
			searchText.length >= (restProps.searchMinCharacters ?? 3)
		);
	}

	onMount(async () => {
		// Initialize container width
		if (containerElement) {
			containerWidth = containerElement.clientWidth;
		}

		if (text) {
			lines = processText(text, wrapLines, getMaxLineLength());
		} else if (url) {
			if (restProps.websocket || restProps.eventsource) {
				setupConnection();
			} else {
				await fetchLog();
			}
		}

		// Set up resize observer to recalculate line wrapping when container size changes
		if (containerElement) {
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					containerWidth = entry.contentRect.width;
					if (wrapLines && lines.length > 0) {
						// Re-process text when container width changes
						if (text) {
							lines = processText(text, wrapLines, getMaxLineLength());
						}
					}
				}
			});

			resizeObserver.observe(containerElement);
		}
	});

	onDestroy(() => {
		// Clean up connections when component is destroyed
		if (wsClient) {
			wsClient.disconnect();
			wsClient = null;
		}

		if (esClient) {
			esClient.disconnect();
			esClient = null;
		}

		// Clean up resize observer
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
	});

	function setupConnection() {
		if (!url) return;

		if (restProps.websocket) {
			wsClient = new WebSocketClient({
				url,
				websocketOptions: restProps.websocketOptions,
				onMessage: handleMessageReceived,
				onError: handleConnectionError
			});
			wsClient.connect();
		} else if (restProps.eventsource) {
			esClient = new EventSourceClient({
				url,
				eventsourceOptions: restProps.eventsourceOptions,
				onMessage: handleMessageReceived,
				onError: handleConnectionError
			});
			esClient.connect();
		}
	}

	function handleMessageReceived(messageText: string) {
		// Get the next line number based on existing lines
		const nextLineNumber = lines.length > 0 ? lines[lines.length - 1].number + 1 : 1;

		// Process the incoming message text
		const newLines = processText(messageText, wrapLines, getMaxLineLength(), nextLineNumber);

		// Append to existing lines
		lines = [...lines, ...newLines];

		// Update search results if search is active
		if (searchText && searchText.length >= (restProps.searchMinCharacters ?? 3)) {
			matches = findMatches(
				lines,
				searchText,
				Boolean(currentCaseInsensitive),
				restProps.searchMinCharacters ?? 3
			);
		}

		// Auto-scroll to bottom if follow is enabled
		if (
			restProps.follow &&
			virtualContainer &&
			typeof virtualContainer.scrollToIndex === 'function'
		) {
			// Schedule this to happen after the UI has updated
			setTimeout(() => {
				virtualContainer.scrollToIndex(lines.length - 1);
			}, 0);
		}
	}

	function handleConnectionError(error: Error) {
		console.error('Connection error in lazylog:', error);
		if (typeof restProps.onError === 'function') {
			restProps.onError(error);
		}
	}

	async function handleStreaming(response: Response) {
		const reader = response.body!.getReader();
		const decoder = new TextDecoder();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const chunk = decoder.decode(value, { stream: true });
			const nextLineNumber = lines.length > 0 ? lines[lines.length - 1].number + 1 : 1;
			const newLines = processText(chunk, wrapLines, getMaxLineLength(), nextLineNumber);
			lines = [...lines, ...newLines];
		}
	}

	async function fetchLog() {
		try {
			const response = await fetch(url!);
			if (stream) {
				await handleStreaming(response);
			} else {
				const text = await response.text();
				lines = processText(text, wrapLines, getMaxLineLength());
			}
		} catch (error) {
			console.error('Error fetching log:', error);
		}
	}
</script>

<div
	class="lazylog"
	style="height: {height}; width: {width}; {Object.entries(style ?? {})
		.map(([k, v]) => `${k}: ${v}`)
		.join(';')}"
	bind:this={containerElement}
>
	<SearchBar
		{searchText}
		caseInsensitive={currentCaseInsensitive}
		totalResults={matches.length}
		currentResult={currentMatchIndex >= 0 ? currentMatchIndex : 0}
		searchMinCharacters={restProps.searchMinCharacters ?? 3}
		onsearch={handleSearch}
		onnextResult={handleNextResult}
		onpreviousResult={handlePreviousResult}
	/>

	<VList
		class="svelte-lazylog-content"
		itemSize={24}
		data={lines}
		bind:this={virtualContainer}
		style={Object.entries(containerStyle ?? {})
			.map(([k, v]) => `${k}: ${v}`)
			.join(';')}
	>
		{#snippet children(item)}
			<Line
				line={item}
				highlighted={isLineHighlighted(item.number)}
				{searchText}
				searchActive={searchText.length >= (restProps.searchMinCharacters ?? 3)}
				caseInsensitive={currentCaseInsensitive}
				isActiveMatch={isActiveMatchLine(item.number)}
				lineMatches={getMatchesForLine(matches, item.number)}
				activeMatch={getActiveMatchForLine(matches, currentMatchIndex, item.number)}
				{wrapLines}
			/>
		{/snippet}
	</VList>
</div>

<style>
	.lazylog {
		background: #222;
		color: #ffffff;
		overflow: hidden;
		font-family: Monaco, monospace;
		font-size: 12px;
		scrollbar-color: #666 #222;
	}

	:global(.svelte-lazylog-content) {
		height: 100%;
		scrollbar-color: #666 #222; /* For Firefox */
	}
</style>
