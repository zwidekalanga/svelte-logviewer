import type { LineContent } from './log-content.js';

export interface LogLine {
	number: number;
	content: LineContent[];
}
