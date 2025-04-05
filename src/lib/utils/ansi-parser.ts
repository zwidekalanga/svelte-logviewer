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
		if (!text.includes(ESC)) {
			// Fast path if no escape sequences
			return [{ text }];
		}

		const parts: AnsiPart[] = [];
		let currentPart: AnsiPart = { text: '' };
		let inEscapeSequence = false;
		let escapeBuffer = '';

		for (let i = 0; i < text.length; i++) {
			const char = text[i];

			// Check for escape sequence start
			if (char === ESC && text[i + 1] === '[') {
				inEscapeSequence = true;
				escapeBuffer = '';
				i++; // Skip the [
				continue;
			}

			if (inEscapeSequence) {
				// End of escape sequence
				if (char === 'm') {
					inEscapeSequence = false;

					// If we have text in the current part, save it
					if (currentPart.text.length > 0) {
						parts.push({ ...currentPart });
						currentPart = {
							text: '',
							foreground: currentPart.foreground,
							background: currentPart.background,
							bold: currentPart.bold,
							italic: currentPart.italic,
							underline: currentPart.underline,
							blink: currentPart.blink,
							inverse: currentPart.inverse
						};
					}

					// Process the escape code
					const codes = escapeBuffer.split(';');
					processAnsiCodes(codes, currentPart);
					continue;
				}

				// Collect escape sequence characters
				escapeBuffer += char;
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
	} catch (error) {
		console.error('Error parsing ANSI text:', error);
		// Fallback: Return the text without parsing
		return [{ text }];
	}
}

/**
 * Process ANSI codes and update the current part's formatting
 */
function processAnsiCodes(codes: string[], part: AnsiPart): void {
	if (codes.length === 0 || codes[0] === '0' || codes[0] === '') {
		// Reset all formatting
		delete part.foreground;
		delete part.background;
		delete part.bold;
		delete part.italic;
		delete part.underline;
		delete part.blink;
		delete part.inverse;
		return;
	}

	for (const code of codes) {
		const codeNum = code.trim();

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
}

export default parseAnsi;
