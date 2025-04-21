import { describe, it, expect } from 'vitest';

import { encode, decode } from '../../../src/lib/utils/encoding';

describe('Encoding utilities', () => {
	const testStrings = [
		'Simple ASCII string',
		'Unicode characters: 你好，世界！',
		'Special chars: &^%$#@!~',
		'Emojis: 😀 🚀 🎉',
		'Empty string',
		'Numbers: 12345',
		'Very long string: ' + 'a'.repeat(1000)
	];

	it('should encode strings to Uint8Array', () => {
		for (const str of testStrings) {
			const encoded = encode(str);
			expect(encoded).toBeInstanceOf(Uint8Array);

			// Check if the length is appropriate (varies by content)
			if (str.length > 0) {
				expect(encoded.length).toBeGreaterThan(0);
			}
		}
	});

	it('should decode Uint8Array back to strings', () => {
		for (const str of testStrings) {
			const encoded = encode(str);
			const decoded = decode(encoded);
			expect(decoded).toBe(str);
		}
	});

	it('should handle empty string correctly', () => {
		const emptyStr = '';
		const encoded = encode(emptyStr);
		expect(encoded.length).toBe(0);
		expect(decode(encoded)).toBe(emptyStr);
	});

	it('should encode and decode back with full round-trip fidelity', () => {
		for (const str of testStrings) {
			expect(decode(encode(str))).toBe(str);
		}
	});
});
