<script lang="ts">
	import type { LineContent } from '../../../types/log-content.js';

	// Define the Match interface to match what's in log-viewer.svelte
	interface Match {
		lineNumber: number;
		partIndex: number;
		startIndex: number;
		endIndex: number;
	}

	const {
		part,
		searchText = '',
		searchActive = false,
		caseInsensitive = false,
		isActiveMatch = false,
		partMatches = [],
		isActiveMatchPart = false,
		activeMatch = null
	} = $props<{
		part: LineContent;
		searchText?: string;
		searchActive?: boolean;
		caseInsensitive?: boolean;
		isActiveMatch?: boolean;
		partMatches?: Match[];
		isActiveMatchPart?: boolean;
		activeMatch?: Match | null;
	}>();

	interface Segment {
		text: string;
		isMatch: boolean;
		isActiveMatch: boolean;
		startIndex: number;
		endIndex: number;
	}

	// Process the text into segments based on matches
	function calculateSegments(): Segment[] {
		// If no search or no text, return the whole text
		if (!searchActive || !searchText || !part.text) {
			return [{ 
				text: part.text || '', 
				isMatch: false, 
				isActiveMatch: false,
				startIndex: 0,
				endIndex: (part.text || '').length
			}];
		}

		// If no matches in this part, return the whole text
		if (partMatches.length === 0) {
			return [{ 
				text: part.text, 
				isMatch: false, 
				isActiveMatch: false,
				startIndex: 0,
				endIndex: part.text.length
			}];
		}

		// Sort matches by start index
		const sortedMatches = [...partMatches].sort((a, b) => a.startIndex - b.startIndex);

		// Create segments
		const segments: Segment[] = [];
		let lastIndex = 0;

		// Process each match
		for (const match of sortedMatches) {
			// Add text before this match if there is any
			if (match.startIndex > lastIndex) {
				segments.push({
					text: part.text.substring(lastIndex, match.startIndex),
					isMatch: false,
					isActiveMatch: false,
					startIndex: lastIndex,
					endIndex: match.startIndex
				});
			}

			// Add the match
			const isActive = activeMatch !== null && 
							 match.lineNumber === activeMatch.lineNumber && 
							 match.partIndex === activeMatch.partIndex && 
							 match.startIndex === activeMatch.startIndex;

			segments.push({
				text: part.text.substring(match.startIndex, match.endIndex),
				isMatch: true,
				isActiveMatch: isActive,
				startIndex: match.startIndex,
				endIndex: match.endIndex
			});

			lastIndex = match.endIndex;
		}

		// Add any remaining text after the last match
		if (lastIndex < part.text.length) {
			segments.push({
				text: part.text.substring(lastIndex),
				isMatch: false,
				isActiveMatch: false,
				startIndex: lastIndex,
				endIndex: part.text.length
			});
		}

		return segments;
	}

	let partSegments = $derived(calculateSegments());
</script>

<span
	style:color={part.foreground}
	style:background-color={part.background}
	style:font-weight={part.bold ? 'bold' : 'normal'}
	style:font-style={part.italic ? 'italic' : 'normal'}
	style:text-decoration={part.underline ? 'underline' : 'none'}
>
	{#each partSegments as segment}
		{#if segment.isMatch}
			<span class="highlight" class:active-match={segment.isActiveMatch}>{segment.text}</span>
		{:else}
			{segment.text}
		{/if}
	{/each}
</span>

<style>
	span {
		white-space: pre;
	}
	
	.highlight {
		background-color: #ff0; /* Yellow */
		color: #000;
		font-weight: bold;
	}
	
	.active-match {
		background-color: #ff10f0; /* Pink */
		box-shadow: 0 0 2px 1px #ff10f0;
	}
</style>
