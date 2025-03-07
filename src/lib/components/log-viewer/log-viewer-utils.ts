import type { LogViewerProps } from '../../../types/log-viewer.js';
import type { LogLine } from '../../../types/log-line.js';
import { default as parseAnsi } from 'ansiparse';

export const DEFAULT_PROPS: LogViewerProps = {
	containerStyle: { height: 'calc(100% - 40px)' },
	caseInsensitive: false,
	enableGutters: false,
	enableHotKeys: false,
	enableLineNumbers: true,
	enableLinks: false,
	enableMultilineHighlight: true,
	enableSearch: false,
	enableSearchNavigation: true,
	wrapLines: false,
	extraLines: 0,
	fetchOptions: { credentials: 'omit' },
	follow: false,
	formatPart: undefined,
	height: 'auto',
	highlight: [],
	highlightLineClassName: '',
	lineClassName: '',
	onError: undefined,
	onLoad: undefined,
	rowHeight: 19,
	scrollToLine: 0,
	searchMinCharacters: 2,
	selectableLines: false,
	stream: false,
	style: {},
	websocket: false,
	websocketOptions: {},
	eventsource: false,
	eventsourceOptions: {},
	width: 'auto',
	external: false,
	url: undefined,
	text: undefined
};

export function processText(text: string): LogLine[] {
	return text.split('\n').map((line, index) => ({
		number: index + 1,
		content: parseAnsi(line)
	}));
}

export function isHighlighted(lineNumber: number, highlight: number | number[]): boolean {
	if (Array.isArray(highlight)) {
		if (highlight.length === 2) {
			return lineNumber >= highlight[0] && lineNumber <= highlight[1];
		}
		return highlight.includes(lineNumber);
	}
	return lineNumber === highlight;
}
