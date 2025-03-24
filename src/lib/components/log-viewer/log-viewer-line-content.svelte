<script lang="ts">
	import type { LineContent } from '../../../types/log-content.js';
	import LinePart from './log-viewer-line-part.svelte';

	// Define the Match interface to match what's in log-viewer.svelte
	interface Match {
		lineNumber: number;
		partIndex: number;
		startIndex: number;
		endIndex: number;
	}

	const {
		content,
		searchText = '',
		searchActive = false,
		caseInsensitive = false,
		isActiveMatch = false,
		lineMatches = [],
		activeMatch = null
	} = $props<{
		content: LineContent[];
		searchText?: string;
		searchActive?: boolean;
		caseInsensitive?: boolean;
		isActiveMatch?: boolean;
		lineMatches?: Match[];
		activeMatch?: Match | null;
	}>();

	// Function to get matches for a specific part
	function getMatchesForPart(partIndex: number): Match[] {
		return lineMatches.filter(match => match.partIndex === partIndex);
	}

	// Function to check if a part has the active match
	function isActiveMatchPart(partIndex: number): boolean {
		return activeMatch !== null && activeMatch.partIndex === partIndex;
	}
</script>

<span class="line-content">
	{#each content as part, partIndex}
		<LinePart 
			part={part} 
			searchText={searchText}
			searchActive={searchActive}
			caseInsensitive={caseInsensitive}
			isActiveMatch={isActiveMatch}
			partMatches={getMatchesForPart(partIndex)}
			isActiveMatchPart={isActiveMatchPart(partIndex)}
			activeMatch={isActiveMatchPart(partIndex) ? activeMatch : null}
		/>
	{/each}
</span>

<style>
	.line-content {
		padding-left: 10px;
		flex: 1;
		white-space: nowrap;
	}
</style>
