<script lang="ts">
	import LinePart from './log-viewer-line-part.svelte';

	import type { LineContent } from '$lib/types/log-content.js';
	import type { Match } from './log-viewer-utils.js';

	const {
		content,
		searchText = '',
		searchActive = false,
		caseInsensitive = false,
		isActiveMatch = false,
		lineMatches = [],
		activeMatch = null,
		wrapLines = false
	} = $props<{
		content: LineContent[];
		searchText?: string;
		searchActive?: boolean;
		caseInsensitive?: boolean;
		isActiveMatch?: boolean;
		lineMatches?: Match[];
		activeMatch?: Match | null;
		wrapLines?: boolean;
	}>();

	// Function to get matches for a specific part
	function getMatchesForPart(partIndex: number): Match[] {
		return lineMatches.filter((match: Match) => match.partIndex === partIndex);
	}

	// Function to check if a part has the active match
	function isActiveMatchPart(partIndex: number): boolean {
		return activeMatch !== null && activeMatch.partIndex === partIndex;
	}
</script>

<span class="line-content" class:wrapped={wrapLines}>
	{#each content as part, partIndex}
		<LinePart
			{part}
			{searchText}
			{searchActive}
			{caseInsensitive}
			{isActiveMatch}
			partMatches={getMatchesForPart(partIndex)}
			isActiveMatchPart={isActiveMatchPart(partIndex)}
			activeMatch={isActiveMatchPart(partIndex) ? activeMatch : null}
			{wrapLines}
		/>
	{/each}
</span>

<style>
	.line-content {
		padding-left: 10px;
		flex: 1;
		white-space: nowrap;
	}

	.line-content.wrapped {
		white-space: normal;
		word-wrap: break-word;
		word-break: break-all;
	}
</style>
