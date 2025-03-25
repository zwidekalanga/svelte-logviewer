<script lang="ts">
	import type { LogLine } from '../../../types/log-line.js';
	import LineNumber from './log-viewer-line-number.svelte';
	import LineContent from './log-viewer-line-content.svelte';
	import type { Match } from './log-viewer-utils.js';

	const {
		line,
		highlighted = false,
		searchText = '',
		searchActive = false,
		caseInsensitive = false,
		isActiveMatch = false,
		lineMatches = [],
		activeMatch = null
	} = $props<{
		line: LogLine;
		highlighted?: boolean;
		searchText?: string;
		searchActive?: boolean;
		caseInsensitive?: boolean;
		isActiveMatch?: boolean;
		lineMatches?: Match[];
		activeMatch?: Match | null;
	}>();
</script>

<div class="line" class:highlighted>
	<LineNumber number={line.number} highlighted={highlighted} />
	<LineContent 
		content={line.content} 
		searchText={searchText}
		searchActive={searchActive}
		caseInsensitive={caseInsensitive}
		isActiveMatch={isActiveMatch}
		lineMatches={lineMatches}
		activeMatch={activeMatch}
	/>
</div>

<style>
	.line {
		/* display: block; 	*/
		/* font-family: monospace; */
		line-height: 1.5;
		white-space: nowrap;
	}

	.line:hover {
		background-color: #444444;
	}

	.highlighted {
		background-color: #666;
	}
</style>
