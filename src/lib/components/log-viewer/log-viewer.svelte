<script lang="ts">
	import { onMount } from 'svelte';
	import type { SvelteComponent } from 'svelte';
	import { VList } from 'virtua/svelte';
	import SearchBar from './log-viewer-search-bar.svelte';
	import type { LogViewerProps } from '../../../types/log-viewer.js';
	import type { LogLine } from '../../../types/log-line.js';
	import Line from './log-viewer-line.svelte';
	import { default as parseAnsi } from 'ansiparse';

	const {
		containerStyle = {
			// width: 'auto',
			// maxWidth: 'initial',
			// overflow: 'initial'
		},
		caseInsensitive = false,
		enableGutters = false,
		enableHotKeys = false,
		enableLineNumbers = true,
		enableLinks = false,
		enableMultilineHighlight = true,
		enableSearch = false,
		enableSearchNavigation = true,
		wrapLines = false,
		extraLines = 0,
		fetchOptions = { credentials: 'omit' },
		follow = false,
		formatPart = undefined,
		height = 'auto',
		highlight = [],
		highlightLineClassName = '',
		lineClassName = '',
		onError = undefined,
		onLoad: undefined,
		rowHeight = 19,
		scrollToLine = 0,
		searchMinCharacters = 2,
		selectableLines = false,
		stream = false,
		style = {},
		websocket = false,
		websocketOptions = {},
		eventsource = false,
		eventsourceOptions = {},
		width = 'auto',
		external = false,
		url,
		text = undefined
	}: LogViewerProps = $props();

	let lines = $state<LogLine[]>([]);
	let virtualContainer: SvelteComponent;

	onMount(async () => {
		if (text) {
			processText(text);
		} else if (url) {
			await fetchLog();
		}
	});

	async function fetchLog() {
		try {
			const response = await fetch(url!);
			if (stream) {
				// Handle streaming
				const reader = response.body!.getReader();
				let decoder = new TextDecoder();

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					processText(chunk);
				}
			} else {
				const text = await response.text();
				processText(text);
			}
		} catch (error) {
			console.error('Error fetching log:', error);
		}
	}

	function processText(text: string) {
		const newLines = text.split('\n').map((line, index) => ({
			number: index + 1,
			content: parseAnsi(line)
		}));

		lines = [...lines, ...newLines];
	}

	function isHighlighted(lineNumber: number, highlight: number | number[]): boolean {
		if (Array.isArray(highlight)) {
			if (highlight.length === 2) {
				return lineNumber >= highlight[0] && lineNumber <= highlight[1];
			}
			return highlight.includes(lineNumber);
		}
		return lineNumber === highlight;
	}
</script>

<div
	class="log-viewer"
	style="height: {height}; width: {width}; {Object.entries(style ?? {})
		.map(([k, v]) => `${k}: ${v}`)
		.join(';')}"
>
	<SearchBar searchText="" {caseInsensitive} searchMinCharacters />

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
			<Line line={item} highlighted={isHighlighted(item.number, highlight)} />
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
