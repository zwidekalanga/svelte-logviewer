// Custom implementation of ANSI parsing that avoids legacy octal escapes

// Use hexadecimal escape sequences instead of octal
const ESC = '\x1B'; // hexadecimal for escape character (0x1B)

// Color mapping
const COLORS: Record<string, string> = {
	'30': 'black',
	'31': 'red',
	'32': 'green',
	'33': 'yellow',
	'34': 'blue',
	'35': 'magenta',
	'36': 'cyan',
	'37': 'white',
	'90': 'grey',
	'91': 'brightred',
	'92': 'brightgreen',
	'93': 'brightyellow',
	'94': 'brightblue',
	'95': 'brightmagenta',
	'96': 'brightcyan',
	'97': 'brightwhite'
};

// Background color mapping
const BG_COLORS: Record<string, string> = {
	'40': 'black',
	'41': 'red',
	'42': 'green',
	'43': 'yellow',
	'44': 'blue',
	'45': 'magenta',
	'46': 'cyan',
	'47': 'white',
	'100': 'grey',
	'101': 'brightred',
	'102': 'brightgreen',
	'103': 'brightyellow',
	'104': 'brightblue',
	'105': 'brightmagenta',
	'106': 'brightcyan',
	'107': 'brightwhite'
};

interface AnsiPart {
	text: string;
	foreground?: string;
	background?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	blink?: boolean;
	inverse?: boolean;
}

/**
 * Parses ANSI escape sequences in text
 */
export function parseAnsi(text: string): AnsiPart[] {
	try {
		// Fast path if no escape sequences
		if (!text.includes(ESC)) {
			return [{ text }];
		}

		return parseTextWithEscapes(text);
	} catch (error) {
		console.error('Error parsing ANSI text:', error);
		// Fallback: Return the text without parsing
		return [{ text }];
	}
}

/**
 * Parse text containing ANSI escape sequences
 */
function parseTextWithEscapes(text: string): AnsiPart[] {
	const parts: AnsiPart[] = [];
	const currentPart: AnsiPart = { text: '' };
	let inEscapeSequence = false;
	let escapeBuffer = '';

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		// Check for escape sequence start
		if (isEscapeStart(char, text[i + 1])) {
			inEscapeSequence = true;
			escapeBuffer = '';
			i++; // Skip the [
			continue;
		}

		if (inEscapeSequence) {
			// Handle escape sequence character
			if (char === 'm') {
				// End of escape sequence
				inEscapeSequence = false;
				handleEscapeSequence(escapeBuffer, currentPart, parts);
			} else {
				// Collect escape sequence characters
				escapeBuffer += char;
			}
		} else {
			// Regular text
			currentPart.text += char;
		}
	}

	// Add the last part if it has text
	if (currentPart.text.length > 0) {
		parts.push(currentPart);
	}

	return parts;
}

/**
 * Check if characters represent the start of an escape sequence
 */
function isEscapeStart(char: string, nextChar: string): boolean {
	return char === ESC && nextChar === '[';
}

/**
 * Handle a complete escape sequence and update parts accordingly
 */
function handleEscapeSequence(
	escapeBuffer: string,
	currentPart: AnsiPart,
	parts: AnsiPart[]
): void {
	// If we have text in the current part, save it and create a new part
	if (currentPart.text.length > 0) {
		parts.push({ ...currentPart });
		currentPart.text = '';
	}

	// Process the escape code
	const codes = escapeBuffer.split(';');
	processAnsiCodes(codes, currentPart);
}

/**
 * Process ANSI codes and update the current part's formatting
 */
function processAnsiCodes(codes: string[], part: AnsiPart): void {
	if (codes.length === 0 || codes[0] === '0' || codes[0] === '') {
		// Reset all formatting
		resetFormatting(part);
		return;
	}

	for (const code of codes) {
		const codeNum = code.trim();
		applyCodeToFormatting(codeNum, part);
	}
}

/**
 * Reset all formatting attributes in a part
 */
function resetFormatting(part: AnsiPart): void {
	delete part.foreground;
	delete part.background;
	delete part.bold;
	delete part.italic;
	delete part.underline;
	delete part.blink;
	delete part.inverse;
}

/**
 * Apply a specific ANSI code to part formatting
 */
function applyCodeToFormatting(codeNum: string, part: AnsiPart): void {
	// Text formatting
	if (codeNum === '1') part.bold = true;
	else if (codeNum === '3') part.italic = true;
	else if (codeNum === '4') part.underline = true;
	else if (codeNum === '5') part.blink = true;
	else if (codeNum === '7') part.inverse = true;
	// Reset specific formatting
	else if (codeNum === '22') delete part.bold;
	else if (codeNum === '23') delete part.italic;
	else if (codeNum === '24') delete part.underline;
	else if (codeNum === '25') delete part.blink;
	else if (codeNum === '27') delete part.inverse;
	// Foreground color
	else if (COLORS[codeNum]) {
		part.foreground = COLORS[codeNum];
	}
	// Background color
	else if (BG_COLORS[codeNum]) {
		part.background = BG_COLORS[codeNum];
	}
}

export default parseAnsi;
