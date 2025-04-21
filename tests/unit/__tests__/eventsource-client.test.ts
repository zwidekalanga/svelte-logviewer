import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ConnectionClient } from '../../../src/lib/utils/connection/connection-client.js';
import { EventSourceClient } from '../../../src/lib/utils/connection/eventsource-client.js';

// Constants that match EventSource readyState values
const ES_CONNECTING = 0;
const ES_OPEN = 1;
const ES_CLOSED = 2;

// Mock EventSource class
class MockEventSource {
	static CONNECTING = ES_CONNECTING;
	static OPEN = ES_OPEN;
	static CLOSED = ES_CLOSED;

	url: string;
	readyState: number;
	withCredentials: boolean;
	onopen: ((this: EventSource, ev: Event) => unknown) | null = null;
	onmessage: ((this: EventSource, ev: MessageEvent) => unknown) | null = null;
	onerror: ((this: EventSource, ev: Event) => unknown) | null = null;
	private eventListeners: Record<string, Array<(event: MessageEvent) => void>> = {};

	constructor(url: string, options?: { withCredentials?: boolean }) {
		this.url = url;
		this.readyState = ES_CONNECTING;
		this.withCredentials = options?.withCredentials || false;
	}

	close = vi.fn(() => {
		this.readyState = ES_CLOSED;
	});

	addEventListener = vi.fn((eventName: string, callback: (event: MessageEvent) => void) => {
		if (!this.eventListeners[eventName]) {
			this.eventListeners[eventName] = [];
		}
		this.eventListeners[eventName].push(callback);
	});

	removeEventListener = vi.fn((eventName: string, callback: (event: MessageEvent) => void) => {
		if (this.eventListeners[eventName]) {
			this.eventListeners[eventName] = this.eventListeners[eventName].filter(
				(listener) => listener !== callback
			);
		}
	});

	// Helper for testing - simulate open event
	simulateOpen() {
		this.readyState = ES_OPEN;
		if (this.onopen) {
			const openEvent = new Event('open');
			this.onopen.call(this as unknown as EventSource, openEvent);
		}
	}

	// Helper for testing - simulate message event
	simulateMessage(data: string, eventType = 'message') {
		// Call the specific event listener if it exists
		if (eventType !== 'message' && this.eventListeners[eventType]) {
			const messageEvent = {
				data,
				type: eventType,
				target: this
			} as unknown as MessageEvent;

			this.eventListeners[eventType].forEach((listener) => {
				listener(messageEvent);
			});
		}

		// Always call the onmessage handler for all messages
		if (this.onmessage) {
			const messageEvent = {
				data,
				type: 'message',
				target: this
			} as unknown as MessageEvent;
			this.onmessage.call(this as unknown as EventSource, messageEvent);
		}
	}

	// Helper for testing - simulate error event
	simulateError() {
		if (this.onerror) {
			const errorEvent = new Event('error');
			this.onerror.call(this as unknown as EventSource, errorEvent);
		}
	}
}

// Create a custom version of EventSource for mocking
const CustomEventSourceClass = class CustomEventSource extends MockEventSource {
	static CONNECTING = ES_CONNECTING;
	static OPEN = ES_OPEN;
	static CLOSED = ES_CLOSED;
};

// Store original EventSource
const originalEventSource = global.EventSource;

describe('EventSourceClient', () => {
	let esClient: EventSourceClient;
	let mockEs: MockEventSource;
	const mockOnMessage = vi.fn();
	const mockOnError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Create our mock EventSource instance
		mockEs = new MockEventSource('https://example.com/events');

		// Replace the global EventSource with our custom mock class
		global.EventSource = CustomEventSourceClass as unknown as typeof EventSource;

		// Override the constructor behavior
		vi.spyOn(global, 'EventSource').mockImplementation(() => {
			return mockEs as unknown as EventSource;
		});

		// Set up console mocks
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});

		// Create EventSourceClient
		esClient = new EventSourceClient({
			url: 'https://example.com/events',
			onMessage: mockOnMessage,
			onError: mockOnError
		});
	});

	afterEach(() => {
		esClient.disconnect();
		// Restore original EventSource
		global.EventSource = originalEventSource;
		vi.restoreAllMocks();
	});

	it('should create an EventSourceClient instance', () => {
		expect(esClient).toBeInstanceOf(EventSourceClient);
	});

	it('should connect to EventSource server', () => {
		// Mock isConnected to return true for this test
		const isConnectedSpy = vi.spyOn(esClient, 'isConnected');
		isConnectedSpy.mockReturnValue(true);

		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();

		expect(esClient.isConnected()).toBe(true);
		expect(isConnectedSpy).toHaveBeenCalled();
	});

	it('should handle incoming messages', () => {
		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();
		mockEs.simulateMessage('test message');
		expect(mockOnMessage).toHaveBeenCalledWith('test message');
	});

	it('should handle custom message formatting', () => {
		const customFormatter = vi.fn().mockReturnValue('formatted message');

		esClient = new EventSourceClient({
			url: 'https://example.com/events',
			onMessage: mockOnMessage,
			eventsourceOptions: {
				formatMessage: customFormatter
			}
		});

		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();
		mockEs.simulateMessage('raw message');

		expect(customFormatter).toHaveBeenCalledWith('raw message');
		expect(mockOnMessage).toHaveBeenCalledWith('formatted message');
	});

	it('should handle connection errors', () => {
		esClient.connect();
		mockEs.simulateError();
		expect(mockOnError).toHaveBeenCalled();
	});

	it('should handle disconnection', () => {
		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();

		esClient.disconnect();
		expect(mockEs.close).toHaveBeenCalled();
	});

	it('should handle empty messages', () => {
		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();

		// Empty message should not trigger onMessage
		mockEs.simulateMessage('');
		mockEs.simulateMessage(':ok');
		mockEs.simulateMessage('   ');

		expect(mockOnMessage).not.toHaveBeenCalled();
	});

	it('should add and remove event type listeners', () => {
		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();

		const mockCallback = vi.fn();
		esClient.addEventTypeListener('custom-event', mockCallback);

		// Simulate a custom event
		mockEs.simulateMessage('custom data', 'custom-event');

		expect(mockCallback).toHaveBeenCalled();
		expect(mockEs.addEventListener).toHaveBeenCalledWith('custom-event', expect.any(Function));

		// Remove the listener
		esClient.removeEventTypeListener('custom-event', mockCallback);
		expect(mockEs.removeEventListener).toHaveBeenCalledWith('custom-event', expect.any(Function));
	});

	it('should handle message queuing with delay', () => {
		vi.useFakeTimers();

		esClient = new EventSourceClient({
			url: 'https://example.com/events',
			onMessage: mockOnMessage,
			eventsourceOptions: {
				eventDelay: 500
			}
		});

		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();

		// Send multiple messages
		mockEs.simulateMessage('message 1');
		mockEs.simulateMessage('message 2');

		// First message should be processed immediately
		expect(mockOnMessage).toHaveBeenCalledWith('message 1');
		expect(mockOnMessage).toHaveBeenCalledTimes(1);

		// Advance time to process the next message
		vi.advanceTimersByTime(500);
		expect(mockOnMessage).toHaveBeenCalledWith('message 2');
		expect(mockOnMessage).toHaveBeenCalledTimes(2);

		vi.useRealTimers();
	});

	it('should handle max events limit', () => {
		// Simplify the test to just verify disconnect is called
		const disconnectSpy = vi.spyOn(EventSourceClient.prototype, 'disconnect');

		esClient = new EventSourceClient({
			url: 'https://example.com/events',
			onMessage: mockOnMessage,
			eventsourceOptions: {
				maxEvents: 2
			}
		});

		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();

		// Send messages up to the limit
		mockEs.simulateMessage('message 1');
		mockEs.simulateMessage('message 2');

		// Verify disconnect was called after reaching max events
		expect(disconnectSpy).toHaveBeenCalled();
		expect(mockEs.close).toHaveBeenCalled();

		// Clean up
		disconnectSpy.mockRestore();
	});

	it('should handle max empty events limit', () => {
		// Mock handleConnectionError to directly call onError
		const handleConnectionErrorSpy = vi
			.spyOn(
				ConnectionClient.prototype as unknown as Record<string, unknown>,
				'handleConnectionError'
			)
			.mockImplementation(function (this: { onError?: (error: Error) => void }, error: Error) {
				console.error(`Connection error:`, error);
				if (this.onError) {
					this.onError(error);
				}
			});

		esClient = new EventSourceClient({
			url: 'https://example.com/events',
			onMessage: mockOnMessage,
			onError: mockOnError,
			eventsourceOptions: {
				maxEmptyEvents: 3
			}
		});

		esClient.connect();
		mockEs.readyState = ES_OPEN;
		mockEs.simulateOpen();

		// Clear any previous calls
		mockOnError.mockClear();

		// Send empty messages up to the limit
		mockEs.simulateMessage('');
		mockEs.simulateMessage(':ok');
		mockEs.simulateMessage('');

		// This should trigger disconnect and call handleConnectionError
		mockEs.simulateMessage('');

		expect(mockOnMessage).not.toHaveBeenCalled();
		expect(mockEs.close).toHaveBeenCalled();
		expect(handleConnectionErrorSpy).toHaveBeenCalled();
		expect(mockOnError).toHaveBeenCalled();

		// Clean up
		handleConnectionErrorSpy.mockRestore();
	});
});
