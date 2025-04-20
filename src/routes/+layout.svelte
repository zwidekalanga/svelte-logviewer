<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow-sm">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<div class="flex items-center space-x-2">
				<span class="text-xl font-bold text-gray-800">Svelte LogViewer</span>
				<span class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
					>v{process.env.npm_package_version || '0.0.4'}</span
				>
			</div>
			<div class="flex space-x-4">
				<a
					href="https://github.com/zwidekalanga/svelte-logviewer"
					class="text-gray-600 hover:text-gray-900">GitHub</a
				>
				<a
					href="https://www.npmjs.com/package/@zwidekalanga/svelte-logviewer"
					class="text-gray-600 hover:text-gray-900">NPM</a
				>
			</div>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>
</div>
