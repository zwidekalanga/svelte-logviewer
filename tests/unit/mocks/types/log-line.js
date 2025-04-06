/**
 * @typedef {Object} LinePart
 * @property {string} text - The text content
 * @property {string} [foreground] - Optional text color
 * @property {string} [background] - Optional background color
 * @property {boolean} [bold] - Whether the text is bold
 * @property {boolean} [italic] - Whether the text is italic
 * @property {boolean} [underline] - Whether the text is underlined
 * @property {boolean} [strikethrough] - Whether the text has strikethrough
 */

/**
 * @typedef {Object} LogLine
 * @property {number} number - Line number
 * @property {LinePart[]} content - Content parts of the line
 */

/**
 * @typedef {Object} LineMatch
 * @property {number} lineNumber - Line number where match was found
 * @property {number} partIndex - Index of the LinePart where match was found
 * @property {number} startIndex - Start index in the text
 * @property {number} endIndex - End index in the text
 */

export {};
