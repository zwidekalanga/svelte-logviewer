<script>
	/**
	 * @license lucide-svelte v0.469.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	import Icon from '../Icon.svelte';
	const iconNode = [
		['path', { d: 'm5 12 7-7 7 7' }],
		['path', { d: 'M12 19V5' }]
	];
	/**
	 * @component @name Square
	 * @description Lucide SVG icon component, renders SVG Element with children.
	 *
	 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/square
	 * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
	 *
	 * @param {Object} props - Lucide lucide props and any valid SVG attribute
	 * @returns {FunctionalComponent} Svelte component
	 *
	 */
</script>

<Icon name="up-arrow" {...$$props} {iconNode}>
	<slot />
</Icon>
