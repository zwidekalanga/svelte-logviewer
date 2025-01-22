<script lang="ts">
	import type { LineContent } from '../../../types/log-content.js';

	export let part: LineContent;
</script>

<span
	style:color={part.foreground}
	style:background-color={part.background}
	style:font-weight={part.bold ? 'bold' : 'normal'}
	style:font-style={part.italic ? 'italic' : 'normal'}
	style:text-decoration={part.underline ? 'underline' : 'none'}
>
	{part.text}
</span>

<style>
	span {
		white-space: pre;
	}
</style>
