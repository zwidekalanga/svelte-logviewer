<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { SvelteComponent } from 'svelte';
	import { VList } from 'virtua/svelte';
	import SearchBar from './log-viewer-search-bar.svelte';
	import Line from './log-viewer-line.svelte';
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
	} from './log-viewer-utils.js';
	import type { LogViewerProps } from '../../../lib/types/log-viewer.js';
	import type { LogLine } from '../../../lib/types/log-line.js';
	import WebSocketClient from './websocket-client.js';
	import EventSourceClient from './eventsource-client.js';

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
	}: LogViewerProps = {
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
		if (text) {
			lines = processText(text);
		} else if (url) {
			if (restProps.websocket) {
				setupWebSocketConnection();
			} else if (restProps.eventsource) {
				setupEventSourceConnection();
			} else {
				await fetchLog();
			}
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
	});

	function setupWebSocketConnection() {
		if (!url) return;

		wsClient = new WebSocketClient({
			url,
			websocketOptions: restProps.websocketOptions,
			onMessage: handleMessageReceived,
			onError: handleConnectionError
		});

		wsClient.connect();
	}

	function setupEventSourceConnection() {
		if (!url) return;

		esClient = new EventSourceClient({
			url,
			eventsourceOptions: restProps.eventsourceOptions,
			onMessage: handleMessageReceived,
			onError: handleConnectionError
		});

		esClient.connect();
	}

	function handleMessageReceived(messageText: string) {
		// Process the incoming message text
		const newLines = processText(messageText);

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
		console.error('Connection error in log-viewer:', error);
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
			processText(chunk);
		}
	}

	async function fetchLog() {
		try {
			const response = await fetch(url!);
			if (stream) {
				await handleStreaming(response);
			} else {
				const text = await response.text();
				lines = processText(text);
			}
		} catch (error) {
			console.error('Error fetching log:', error);
		}
	}
</script>

<div
	class="log-viewer"
	style="height: {height}; width: {width}; {Object.entries(style ?? {})
		.map(([k, v]) => `${k}: ${v}`)
		.join(';')}"
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
			/>
		{/snippet}
	</VList>
</div>

<style>
	.log-viewer {
		background: #222;
		color: #ffffff;
		overflow: hidden;
		font-family: Monaco, monospace;
		font-size: 12px;
		scrollbar-color: #666 #222;
	}

	:global(.svelte-lazylog-content) {
		height: 100%;
		white-space: pre;
		scrollbar-color: #666 #222; /* For Firefox */
	}
</style>
