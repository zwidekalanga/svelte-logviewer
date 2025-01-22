<script lang="ts">
	import type { LineContent } from '../../../types/log-content.js';
	import LinePart from './log-viewer-line-part.svelte';

	export let content: LineContent[];
</script>

<span class="line-content">
	{#each content as part}
		<LinePart {part} />
	{/each}
</span>

<style>
	.line-content {
		padding-left: 10px;
		flex: 1;
		white-space: nowrap;
	}
</style>
