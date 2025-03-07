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

	onMount(async () => {
		if (text) {
			lines = processText(text);
		} else if (url) {
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
	<SearchBar searchText="" {caseInsensitive} searchMinCharacters={restProps.searchMinCharacters} />

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
			<Line line={item} highlighted={isHighlighted(item.number, highlight ?? [])} />
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
