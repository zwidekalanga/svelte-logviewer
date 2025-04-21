<script lang="ts">
	import LineContent from './line-content.svelte';
	import LineNumber from './line-number.svelte';

	import type { LogLine } from '$lib/types/log-line.js';
	import type { Match } from './lazylog-utils.js';

	const {
		line,
		highlighted = false,
		searchText = '',
		searchActive = false,
		caseInsensitive = false,
		isActiveMatch = false,
		lineMatches = [],
		activeMatch = null,
		wrapLines = false
	} = $props<{
		line: LogLine;
		highlighted?: boolean;
		searchText?: string;
		searchActive?: boolean;
		caseInsensitive?: boolean;
		isActiveMatch?: boolean;
		lineMatches?: Match[];
		activeMatch?: Match | null;
		wrapLines?: boolean;
	}>();
</script>

<div class="line" class:highlighted class:wrapped={wrapLines}>
	<LineNumber number={line.number} {highlighted} />
	<LineContent
		content={line.content}
		{searchText}
		{searchActive}
		{caseInsensitive}
		{isActiveMatch}
		{lineMatches}
		{activeMatch}
		{wrapLines}
	/>
</div>

<style>
	.line {
		/* display: block; 	*/
		/* font-family: monospace; */
		line-height: 1.5;
		white-space: nowrap;
	}

	.line.wrapped {
		white-space: normal;
		word-wrap: break-word;
		word-break: break-all;
	}

	.line:hover {
		background-color: #444444;
	}

	.highlighted {
		background-color: #666;
	}
</style>
