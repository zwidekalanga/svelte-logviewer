/**
 * Utility functions for handling ANSI escape sequences in text
 */

/**
 * Gets the visible length of text excluding ANSI codes
 */
export function getVisibleLength(text: string): number {
	// Remove all ANSI escape sequences
	const ESC = '\u001b'; // ESC character
	return text.replace(new RegExp(`${ESC}\\[[0-9;]*[a-zA-Z]`, 'g'), '').length;
}

/**
 * Gets active ANSI codes at a specific position in text
 */
export function getActiveAnsiCodes(text: string, position: number): string {
	const codes: string[] = [];
	const ESC = '\u001b'; // ESC character
	const regex = new RegExp(`${ESC}\\[([0-9;]*)([a-zA-Z])`, 'g');
	let match;

	while ((match = regex.exec(text)) !== null) {
		if (match.index > position) break;
		if (match[2] === 'm') {
			if (match[1] === '0' || match[1] === '') {
				codes.length = 0; // Reset
			} else {
				codes.push(match[0]);
			}
		}
	}

	return codes.join('');
}

/**
 * Strips all ANSI codes from text
 */
export function stripAnsiCodes(text: string): string {
	const ESC = '\u001b';
	return text.replace(new RegExp(`${ESC}\\[[0-9;]*[a-zA-Z]`, 'g'), '');
}

/**
 * Splits text at a visible position while preserving ANSI codes
 */
export function splitAtVisiblePosition(text: string, maxVisibleLength: number): [string, string] {
	let visibleLength = 0;
	let actualPosition = 0;
	let inEscapeSequence = false;
	const ESC = '\u001b'; // ESC character

	for (let i = 0; i < text.length; i++) {
		if (text[i] === ESC) {
			inEscapeSequence = true;
			continue;
		}

		if (inEscapeSequence) {
			if (text[i] === 'm') {
				inEscapeSequence = false;
			}
			continue;
		}

		visibleLength++;
		if (visibleLength > maxVisibleLength) {
			actualPosition = i;
			break;
		}
	}

	if (actualPosition === 0) {
		actualPosition = text.length;
	}

	const firstPart = text.slice(0, actualPosition);
	const secondPart = text.slice(actualPosition);

	// Get active ANSI codes at the split point
	const activeAnsiCodes = getActiveAnsiCodes(firstPart, firstPart.length);

	return [firstPart, activeAnsiCodes + secondPart];
}
