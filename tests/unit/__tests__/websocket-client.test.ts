import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { WebSocketClient } from '../../../src/lib/utils/connection/websocket-client.js';

// Constants that match WebSocket readyState values
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

// Mock WebSocket class
class MockWebSocket {
	static CONNECTING = WS_CONNECTING;
	static OPEN = WS_OPEN;
	static CLOSING = WS_CLOSING;
	static CLOSED = WS_CLOSED;

	url: string;
	readyState: number;
	onopen: ((this: WebSocket, ev: Event) => unknown) | null = null;
	onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null = null;
	onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null = null;
	onerror: ((this: WebSocket, ev: Event) => unknown) | null = null;

	constructor(url: string) {
		this.url = url;
		this.readyState = WS_CONNECTING;
	}

	send = vi.fn();
	close = vi.fn((code?: number, reason?: string) => {
		this.readyState = WS_CLOSED;
		if (this.onclose) {
			const closeEvent = {
				code: code || 1000,
				reason: reason || '',
				wasClean: true
			} as CloseEvent;
			this.onclose.call(this as unknown as WebSocket, closeEvent);
		}
	});

	// Helper for testing - simulate open event
	simulateOpen() {
		this.readyState = WS_OPEN;
		if (this.onopen) {
			const openEvent = new Event('open');
			this.onopen.call(this as unknown as WebSocket, openEvent);
		}
	}

	// Helper for testing - simulate message event
	simulateMessage(data: unknown) {
		if (this.onmessage) {
			const messageEvent = {
				data,
				type: 'message',
				target: this
			} as unknown as MessageEvent;
			this.onmessage.call(this as unknown as WebSocket, messageEvent);
		}
	}

	// Helper for testing - simulate error event
	simulateError() {
		if (this.onerror) {
			const errorEvent = new Event('error');
			this.onerror.call(this as unknown as WebSocket, errorEvent);
		}
	}

	// Helper for testing - simulate close event
	simulateClose(code = 1000, reason = '') {
		this.readyState = WS_CLOSED;
		if (this.onclose) {
			const closeEvent = {
				code,
				reason,
				wasClean: true
			} as unknown as CloseEvent;
			this.onclose.call(this as unknown as WebSocket, closeEvent);
		}
	}
}

// Create a custom version of WebSocket for mocking
const CustomWebSocketClass = class CustomWebSocket extends MockWebSocket {
	static CONNECTING = WS_CONNECTING;
	static OPEN = WS_OPEN;
	static CLOSING = WS_CLOSING;
	static CLOSED = WS_CLOSED;
};

// Store original WebSocket
const originalWebSocket = global.WebSocket;

describe('WebSocketClient', () => {
	let wsClient: WebSocketClient;
	let mockWs: MockWebSocket;
	const mockOnMessage = vi.fn();
	const mockOnError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Create our mock WebSocket instance
		mockWs = new MockWebSocket('ws://example.com');

		// Replace the global WebSocket with our custom mock class
		global.WebSocket = CustomWebSocketClass as unknown as typeof WebSocket;

		// Override the constructor behavior
		vi.spyOn(global, 'WebSocket').mockImplementation(() => {
			return mockWs as unknown as WebSocket;
		});

		// Set up console mocks
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		// Create WebSocketClient
		wsClient = new WebSocketClient({
			url: 'ws://example.com',
			onMessage: mockOnMessage,
			onError: mockOnError
		});
	});

	afterEach(() => {
		wsClient.disconnect();
		// Restore original WebSocket
		global.WebSocket = originalWebSocket;
		vi.restoreAllMocks();
	});

	it('should create a WebSocketClient instance', () => {
		expect(wsClient).toBeInstanceOf(WebSocketClient);
	});

	it('should connect to WebSocket server', () => {
		// Mock isConnected to return true for this test
		const isConnectedSpy = vi.spyOn(wsClient, 'isConnected');
		isConnectedSpy.mockReturnValue(true);

		wsClient.connect();
		mockWs.readyState = WS_OPEN;
		mockWs.simulateOpen();

		expect(wsClient.isConnected()).toBe(true);
		expect(isConnectedSpy).toHaveBeenCalled();
	});

	it('should handle incoming messages', () => {
		wsClient.connect();
		mockWs.readyState = WS_OPEN;
		mockWs.simulateOpen();
		mockWs.simulateMessage('test message');
		expect(mockOnMessage).toHaveBeenCalledWith('test message');
	});

	it('should format object messages', () => {
		wsClient.connect();
		mockWs.readyState = WS_OPEN;
		mockWs.simulateOpen();

		const testObj = { test: 'data' };
		mockWs.simulateMessage(testObj);

		expect(mockOnMessage).toHaveBeenCalledWith(JSON.stringify(testObj));
	});

	it('should handle custom message formatting', () => {
		const customFormatter = vi.fn().mockReturnValue('formatted message');

		wsClient = new WebSocketClient({
			url: 'ws://example.com',
			onMessage: mockOnMessage,
			websocketOptions: {
				formatMessage: customFormatter
			}
		});

		wsClient.connect();
		mockWs.readyState = WS_OPEN;
		mockWs.simulateOpen();
		mockWs.simulateMessage('raw message');

		expect(customFormatter).toHaveBeenCalledWith('raw message');
		expect(mockOnMessage).toHaveBeenCalledWith('formatted message');
	});

	it('should handle connection errors', () => {
		wsClient.connect();
		mockWs.simulateError();
		expect(mockOnError).toHaveBeenCalled();
	});

	it('should handle disconnection', () => {
		wsClient.connect();
		mockWs.readyState = WS_OPEN;
		mockWs.simulateOpen();

		wsClient.disconnect(1000, 'test reason');
		expect(mockWs.close).toHaveBeenCalledWith(1000, 'test reason');
	});

	it('should report connection status correctly', () => {
		// Mock isConnected to return controlled values for this test
		const isConnectedSpy = vi.spyOn(wsClient, 'isConnected');

		// Initial state: not connected
		isConnectedSpy.mockReturnValueOnce(false);
		expect(wsClient.isConnected()).toBe(false);

		wsClient.connect();

		// After connect call but before open event: not connected
		isConnectedSpy.mockReturnValueOnce(false);
		expect(wsClient.isConnected()).toBe(false);

		// After open event: connected
		isConnectedSpy.mockReturnValueOnce(true);
		mockWs.readyState = WS_OPEN;
		mockWs.simulateOpen();
		expect(wsClient.isConnected()).toBe(true);

		// After close: not connected
		isConnectedSpy.mockReturnValueOnce(false);
		mockWs.readyState = WS_CLOSED;
		mockWs.simulateClose();
		expect(wsClient.isConnected()).toBe(false);

		expect(isConnectedSpy).toHaveBeenCalledTimes(4);
	});
});
