import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
	ConnectionClient,
	type ConnectionClientOptions
} from '../../../src/lib/components/log-viewer/connection-client.js';

// Create a concrete implementation of ConnectionClient for testing
class TestConnectionClient extends ConnectionClient {
	connectCalled = false;
	disconnectCalled = false;
	isConnectedValue = false;

	constructor(config: ConnectionClientOptions) {
		super(config);
	}

	connect(): void {
		this.connectCalled = true;
	}

	disconnect(): void {
		this.disconnectCalled = true;
	}

	isConnected(): boolean {
		return this.isConnectedValue;
	}

	// Expose protected methods for testing
	public testHandleConnectionError(error: Error): void {
		this.handleConnectionError(error);
	}

	public testFormatMessageData(data: never): string {
		return this.formatMessageData(data);
	}
}

describe('ConnectionClient', () => {
	let client: TestConnectionClient;
	const mockOnMessage = vi.fn();
	const mockOnError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Set up console mocks
		vi.spyOn(console, 'error').mockImplementation(() => {});

		client = new TestConnectionClient({
			url: 'test://example.com',
			onMessage: mockOnMessage,
			onError: mockOnError
		});
	});

	it('should create a ConnectionClient instance', () => {
		expect(client).toBeInstanceOf(ConnectionClient);
		expect(client.url).toBe('test://example.com');
	});

	it('should call connect method', () => {
		client.connect();
		expect(client.connectCalled).toBe(true);
	});

	it('should call disconnect method', () => {
		client.disconnect();
		expect(client.disconnectCalled).toBe(true);
	});

	it('should return connection status', () => {
		expect(client.isConnected()).toBe(false);

		client.isConnectedValue = true;
		expect(client.isConnected()).toBe(true);
	});

	it('should handle connection errors', () => {
		const error = new Error('Test error');
		client.testHandleConnectionError(error);

		expect(console.error).toHaveBeenCalled();
		expect(mockOnError).toHaveBeenCalledWith(error);
	});

	it('should format string message data', () => {
		const result = client.testFormatMessageData('test message' as never);
		expect(result).toBe('test message');
	});

	it('should format object message data', () => {
		const data = { test: 'value' };
		const result = client.testFormatMessageData(data as never);
		expect(result).toBe(JSON.stringify(data));
	});

	it('should use custom message formatter if provided', () => {
		const customFormatter = vi.fn().mockReturnValue('formatted message');

		client = new TestConnectionClient({
			url: 'test://example.com',
			onMessage: mockOnMessage,
			options: {
				formatMessage: customFormatter
			}
		});

		const result = client.testFormatMessageData('raw message' as never);

		expect(customFormatter).toHaveBeenCalledWith('raw message');
		expect(result).toBe('formatted message');
	});

	it('should handle errors in JSON.stringify', () => {
		// Create a circular reference that will cause JSON.stringify to throw
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		client.testFormatMessageData(circular as never);

		expect(console.error).toHaveBeenCalledWith(
			'Failed to stringify message data:',
			expect.any(Error)
		);
	});
});
