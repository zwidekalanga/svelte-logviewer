const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encode(str: string): Uint8Array {
	const encoded = encoder.encode(str);
	// Ensure we're returning a proper Uint8Array by creating a new one if needed
	return new Uint8Array(encoded);
}

export function decode(buffer: Uint8Array): string {
	return decoder.decode(buffer);
}
