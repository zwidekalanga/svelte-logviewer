/**
 * @license lucide-svelte v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
import { SvelteComponentTyped } from 'svelte';

import type { IconNode } from './types';

interface IconAttributes {
	name?: string;
	color?: string;
	size?: number | string;
	strokeWidth?: number | string;
	absoluteStrokeWidth?: boolean;
	iconNode?: IconNode;
	[key: string]: unknown;
}

declare const __propDef: {
	props: IconAttributes;
	events: {
		[evt: string]: CustomEvent<unknown>;
	};
	slots: {
		default: Record<string, never>;
	};
};

export type IconProps = typeof __propDef.props;
export type IconEvents = typeof __propDef.events;
export type IconSlots = typeof __propDef.slots;
export default class Icon extends SvelteComponentTyped<IconProps, IconEvents, IconSlots> {}
export {};
