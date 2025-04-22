<script lang="ts">
	import { LazyLog } from '$lib';

	// Example log content
	const exampleLog = `
[2023-04-15 10:15:32] INFO: Application started successfully
[2023-04-15 10:15:33] DEBUG: Connected to database
[2023-04-15 10:15:34] INFO: User authentication successful
[2023-04-15 10:15:35] WARN: Cache miss for user profile
[2023-04-15 10:15:36] ERROR: Failed to load resource: api/data/123
[2023-04-15 10:15:37] INFO: Processing batch job #45678
[2023-04-15 10:15:38] DEBUG: Memory usage: 256MB
[2023-04-15 10:15:39] INFO: Request completed in 120ms
`.trim();
</script>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="mb-2 text-3xl font-bold">Svelte LazyLog</h1>
		<p class="text-lg text-gray-600">
			A powerful, customizable log viewer component for Svelte applications
		</p>
	</header>

	<section class="mb-8">
		<h2 class="mb-4 text-2xl font-semibold">Demo</h2>
		<div class="overflow-hidden rounded-lg border shadow-sm">
			<LazyLog text={exampleLog} />
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-2xl font-semibold">Installation</h2>
		<pre
			class="overflow-x-auto rounded-lg bg-gray-100 p-4">npm install @zwidekalanga/svelte-lazylog</pre>
		<p class="mt-2">or</p>
		<pre
			class="overflow-x-auto rounded-lg bg-gray-100 p-4">yarn add @zwidekalanga/svelte-lazylog</pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-2xl font-semibold">Usage</h2>
		<pre class="overflow-x-auto rounded-lg bg-gray-100 p-4">
import {LazyLog} from '@zwidekalanga/svelte-lazylog';

// Then in your component
&lt;LazyLog text={'{yourLogContent}'} /&gt;</pre>
	</section>

	<footer class="text-center text-sm text-gray-500">
		<p>
			View the <a
				href="https://github.com/zwidekalanga/svelte-lazylog"
				class="text-blue-500 hover:underline">GitHub repository</a
			> for more information
		</p>
	</footer>
</div>
