<script lang="ts">
	import { DownArrow, UpArrow } from '$lib/lucide/index.js';

	let {
		searchText = '',
		caseInsensitive = false,
		totalResults = 0,
		currentResult = 0,
		searchMinCharacters = 3,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onsearch = ({ value, caseInsensitive }: { value: string; caseInsensitive: boolean }) => {},
		onnextResult = () => {},
		onpreviousResult = () => {}
	} = $props();

	function handleSearch(event: Event) {
		const value = (event.target as HTMLInputElement).value;

		// Only call search callback if input meets minimum character requirement
		// Always dispatch when empty to clear results
		if (value === '' || value.length >= searchMinCharacters) {
			onsearch({ value, caseInsensitive });
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			if (event.shiftKey) {
				onpreviousResult();
			} else {
				onnextResult();
			}
		}
	}

	function handlePreviousClick() {
		onpreviousResult();
	}

	function handleNextClick() {
		onnextResult();
	}

	// Use derived state to update the match count text whenever totalResults or currentResult changes
	let matchesText = $derived(
		totalResults > 0 ? `${currentResult + 1} of ${totalResults}` : `0 matches`
	);
</script>

<div class="svelte-lazylog-searchbar">
	<div class="search-input-container">
		<input
			type="text"
			bind:value={searchText}
			oninput={handleSearch}
			onkeydown={handleKeyDown}
			placeholder="Search..."
			class="search-input"
		/>
	</div>

	{#if searchText}
		<span class="results-counter" class:disabled={totalResults === 0}>
			{#if searchText.length < searchMinCharacters}
				Type at least {searchMinCharacters} characters to search
			{:else}
				{matchesText}
			{/if}
		</span>

		<div class="navigation-buttons">
			<button
				onclick={handlePreviousClick}
				disabled={totalResults === 0}
				title="Previous match (Shift+Enter)"
				aria-label="Previous search result"
			>
				<UpArrow color="#d6d6d6" size={18} strokeWidth={3.5} />
			</button>
			<button
				onclick={handleNextClick}
				disabled={totalResults === 0}
				title="Next match (Enter)"
				aria-label="Next search result"
			>
				<DownArrow color="#d6d6d6" size={18} strokeWidth={3.5} />
			</button>
		</div>
	{/if}
</div>

<style>
	input:focus {
		outline: none;
		/*border: 1px solid #ffffff;*/
		/*box-shadow: 0 0 4px #ffffff;*/
	}

	.svelte-lazylog-searchbar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem;
		background: var(--background-color, #1e1e1e);
		border-bottom: 1px solid var(--border-color, #333);
	}

	.search-input-container {
		display: flex;
		flex: 1;
		gap: 0.5rem;
	}

	.search-input {
		flex: 1;
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--border-color, #333);
		border-radius: 4px;
		background: var(--input-background, #464646);
		color: var(--text-color, #cacaca);
	}

	.results-counter {
		color: var(--text-color, #d6d6d6);
		font-size: 1em;
		margin-left: 0.3125rem;
	}

	.results-counter.disabled {
		opacity: 0.5;
	}

	.navigation-buttons {
		display: flex;
	}

	.navigation-buttons button {
		all: unset;
		padding: 3px 4px 2px;
		border-radius: 4px;
	}

	.navigation-buttons button:enabled:hover {
		background: #6d6d6d;
	}

	.navigation-buttons button:disabled {
		opacity: 0.5;
	}
</style>
