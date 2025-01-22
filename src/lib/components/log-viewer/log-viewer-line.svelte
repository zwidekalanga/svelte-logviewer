<script lang="ts">
	import type { LogLine } from '../../../types/log-line.js';
	import LineNumber from './log-viewer-line-number.svelte';
	import LineContent from './log-viewer-line-content.svelte';

	export let line: LogLine;
	export let highlighted: boolean = false;
</script>

<div class="line" class:highlighted>
	<LineNumber number={line.number} {highlighted} />
	<LineContent content={line.content} />
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
