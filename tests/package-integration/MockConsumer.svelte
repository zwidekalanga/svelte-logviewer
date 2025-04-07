<script lang="ts">
	import { LogViewer } from '../../dist/index.js';
	import type { LogViewerProps } from '../../dist/index.js';

	export let sampleText = 'Line 1\nLine 2\nLine 3';
	export let props: Partial<LogViewerProps> = {};
</script>

<div class="mock-consumer">
	<h2>LogViewer Test</h2>
	<div class="log-container">
		<LogViewer text={sampleText} height="200px" enableSearch={true} {...props} />
	</div>
</div>

<style>
	.mock-consumer {
		font-family: sans-serif;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.log-container {
		margin-top: 1rem;
	}
</style>
