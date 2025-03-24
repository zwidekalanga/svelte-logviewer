<script lang="ts">
	import { onMount } from 'svelte';
	import type { SvelteComponent } from 'svelte';
	import { VList } from 'virtua/svelte';
	import SearchBar from './log-viewer-search-bar.svelte';
	import Line from './log-viewer-line.svelte';
	import { DEFAULT_PROPS, processText, isHighlighted } from './log-viewer-utils.js';
	import type { LogViewerProps } from '../../../types/log-viewer.js';
	import type { LogLine } from '../../../types/log-line.js';
	
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
	
	// Search state
	let searchText = $state('');
	let currentCaseInsensitive = $state(caseInsensitive);
	
	// Define a structure to hold each match location
	interface Match {
		lineNumber: number;
		partIndex: number;  // Index of the part in the line.content array
		startIndex: number; // Start index within the part text
		endIndex: number;   // End index within the part text
	}
	
	let matches = $state<Match[]>([]);
	let currentMatchIndex = $state(-1);

	// Add an effect to log match count changes
	$effect(() => {
		console.log('[LogViewer] Total matches:', matches.length);
		console.log('[LogViewer] Current match index:', currentMatchIndex);
	});

	function handleSearch(event: CustomEvent) {
		console.log('[Search] Event received:', event.detail);
		
		if (!event.detail || typeof event.detail.value !== 'string') {
			console.error('[Search] Invalid search event format:', event.detail);
			return;
		}
		
		searchText = event.detail.value;
		currentCaseInsensitive = !!event.detail.caseInsensitive;
		
		// Reset search state if input is too short
		if (searchText.length < (restProps.searchMinCharacters || 2)) {
			console.log('[Search] Text too short, resetting matches');
			matches = [];
			currentMatchIndex = -1;
			return;
		}

		// Find matches at word level, not just line level
		console.log('[Search] Searching for:', searchText, 'Case insensitive:', currentCaseInsensitive);
		console.log('[Search] Searching through lines:', lines.length);
		
		const tempMatches: Match[] = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			// Check each part of the line
			if (Array.isArray(line.content)) {
				for (let partIndex = 0; partIndex < line.content.length; partIndex++) {
					const part = line.content[partIndex];
					if (!part.text) continue;
					
					const contentText = part.text;
					const searchFor = searchText;
					
					// Get comparison values based on case sensitivity
					const compareText = currentCaseInsensitive ? contentText.toLowerCase() : contentText;
					const compareSearch = currentCaseInsensitive ? searchFor.toLowerCase() : searchFor;
					
					// Find all instances of the search text in this part
					let startIdx = 0;
					while (true) {
						const foundIdx = compareText.indexOf(compareSearch, startIdx);
						if (foundIdx === -1) break;
						
						// Add this match
						tempMatches.push({
							lineNumber: line.number,
							partIndex: partIndex,
							startIndex: foundIdx,
							endIndex: foundIdx + compareSearch.length
						});
						
						console.log(`[Search] Match found in line ${line.number}, part ${partIndex}, pos ${foundIdx}:${foundIdx + compareSearch.length}`);
						
						// Move to check for next instance
						startIdx = foundIdx + 1;
					}
				}
			} else {
				console.error(`[Search] Line content not an array:`, line.content);
			}
		}
		
		matches = tempMatches;
		console.log('[Search] Matches found:', matches.length);

		// Set current match to first match, if any
		currentMatchIndex = matches.length > 0 ? 0 : -1;
		console.log('[Search] Current match index:', currentMatchIndex);
		
		// Scroll to first match if found
		if (currentMatchIndex >= 0) {
			console.log('[Search] Scrolling to first match');
			scrollToMatch();
		}
	}

	function handleNextResult() {
		console.log('[Search] Next result requested');
		if (matches.length === 0) {
			console.log('[Search] No matches to navigate');
			return;
		}
		currentMatchIndex = (currentMatchIndex + 1) % matches.length;
		console.log('[Search] New match index:', currentMatchIndex);
		scrollToMatch();
	}

	function handlePreviousResult() {
		console.log('[Search] Previous result requested');
		if (matches.length === 0) {
			console.log('[Search] No matches to navigate');
			return;
		}
		currentMatchIndex = (currentMatchIndex <= 0) 
			? matches.length - 1 
			: currentMatchIndex - 1;
		console.log('[Search] New match index:', currentMatchIndex);
		scrollToMatch();
	}

	function scrollToMatch() {
		if (currentMatchIndex >= 0 && virtualContainer && matches.length > 0) {
			const match = matches[currentMatchIndex];
			console.log('[Search] Scrolling to match:', match);
			
			// Find the index of the line in the array
			const lineIndex = lines.findIndex(line => line.number === match.lineNumber);
			console.log('[Search] Line index in virtual list:', lineIndex);
			
			if (lineIndex !== -1) {
				console.log('[Search] Scrolling to index:', lineIndex);
				if (typeof virtualContainer.scrollToIndex === 'function') {
					virtualContainer.scrollToIndex(lineIndex);
				} else {
					console.error('[Search] scrollToIndex is not a function:', virtualContainer);
					console.log('[Search] virtualContainer:', virtualContainer);
				}
			}
		}
	}

	function getLinesWithMatches(): number[] {
		// Get array of line numbers that have matches
		return [...new Set(matches.map(match => match.lineNumber))];
	}

	function isLineHighlighted(lineNumber: number): boolean {
		// Only check if line is explicitly highlighted by props, not by search
		return isHighlighted(lineNumber, highlight ?? []);
	}

	function isActiveMatchLine(lineNumber: number): boolean {
		// Check if this line contains the active match
		return currentMatchIndex >= 0 && 
			matches[currentMatchIndex]?.lineNumber === lineNumber &&
			searchText.length >= (restProps.searchMinCharacters || 2);
	}

	function getMatchesForLine(lineNumber: number): Match[] {
		// Return all matches for this line
		return matches.filter(match => match.lineNumber === lineNumber);
	}

	function getActiveMatchForLine(lineNumber: number): Match | null {
		// If the active match is on this line, return it, otherwise null
		if (currentMatchIndex >= 0 && matches[currentMatchIndex]?.lineNumber === lineNumber) {
			return matches[currentMatchIndex];
		}
		return null;
	}

	onMount(async () => {
		console.log('[LogViewer] Component mounted');
		console.log('[LogViewer] Initial props:', { text, url, caseInsensitive, highlight, searchMinCharacters: restProps.searchMinCharacters });
		
		if (text) {
			console.log('[LogViewer] Processing provided text');
			lines = processText(text);
			console.log('[LogViewer] Lines processed:', lines.length);
		} else if (url) {
			console.log('[LogViewer] Fetching log from URL:', url);
			await fetchLog();
		}
	});

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
		searchMinCharacters={restProps.searchMinCharacters}
		on:search={handleSearch}
		on:nextResult={handleNextResult}
		on:previousResult={handlePreviousResult}
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
				searchText={searchText}
				searchActive={searchText.length >= (restProps.searchMinCharacters || 2)}
				caseInsensitive={currentCaseInsensitive}
				isActiveMatch={isActiveMatchLine(item.number)}
				lineMatches={getMatchesForLine(item.number)}
				activeMatch={getActiveMatchForLine(item.number)}
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
