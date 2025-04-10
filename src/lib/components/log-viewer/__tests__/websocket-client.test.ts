import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClient } from '../websocket-client.js';

interface WebSocketEvent {
	data?: unknown;
	code?: number;
	reason?: string;
	message?: string;
}

// Type for testing private members
type TestWebSocketClient = WebSocketClient & {
	connection: MockWebSocket | null;
};

// Mock WebSocket
class MockWebSocket {
	static OPEN = 1;
	static CLOSED = 3;

	url: string;
	readyState: number = MockWebSocket.CLOSED;
	onopen: ((event: WebSocketEvent) => void) | null = null;
	onmessage: ((event: WebSocketEvent) => void) | null = null;
	onclose: ((event: WebSocketEvent) => void) | null = null;
	onerror: ((event: WebSocketEvent) => void) | null = null;

	constructor(url: string) {
		this.url = url;
		this.readyState = MockWebSocket.CLOSED;
		setTimeout(() => {
			this.readyState = MockWebSocket.OPEN;
			if (this.onopen) this.onopen({});
		}, 0);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	send(data: string): void {}
	close(code?: number, reason?: string): void {
		this.readyState = MockWebSocket.CLOSED;
		if (this.onclose) this.onclose({ code, reason });
	}
}

// Replace global WebSocket with mock
vi.stubGlobal('WebSocket', MockWebSocket);
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('WebSocketClient', () => {
	let wsClient: WebSocketClient;
	const mockOnMessage = vi.fn();
	const mockOnError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		wsClient = new WebSocketClient({
			url: 'ws://example.com',
			onMessage: mockOnMessage,
			onError: mockOnError
		});
	});

	afterEach(() => {
		wsClient.disconnect();
	});

	it('should create a WebSocketClient instance', () => {
		expect(wsClient).toBeInstanceOf(WebSocketClient);
	});

	it('should connect to WebSocket server', () => {
		wsClient.connect();
		expect(wsClient.isConnected()).toBe(true);
	});

	it('should handle incoming messages', () => {
		wsClient.connect();

		// Access the private connection property for testing
		const client = wsClient as unknown as TestWebSocketClient;
		client._connection!.onmessage?.({ data: 'test message' });

		expect(mockOnMessage).toHaveBeenCalledWith('test message');
	});

	it('should format object messages', () => {
		wsClient.connect();

		const client = wsClient as unknown as TestWebSocketClient;
		const testObj = { test: 'data' };
		client._connection!.onmessage?.({ data: testObj });

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

		const client = wsClient as unknown as TestWebSocketClient;
		client._connection!.onmessage?.({ data: 'raw message' });

		expect(customFormatter).toHaveBeenCalledWith('raw message');
		expect(mockOnMessage).toHaveBeenCalledWith('formatted message');
	});

	it('should handle connection errors', () => {
		wsClient.connect();

		const client = wsClient as unknown as TestWebSocketClient;
		client._connection!.onerror?.({ message: 'connection error' });

		expect(mockOnError).toHaveBeenCalled();
	});

	it('should handle disconnection', () => {
		wsClient.connect();

		// Mock successful connection
		const client = wsClient as unknown as TestWebSocketClient;
		client._connection!.readyState = MockWebSocket.OPEN;

		const closeSpy = vi.spyOn(client._connection!, 'close');
		wsClient.disconnect(1000, 'test reason');

		expect(closeSpy).toHaveBeenCalledWith(1000, 'test reason');
		expect(client._connection).toBeNull();
	});

	it('should report connection status correctly', () => {
		wsClient.connect();

		// Initially not connected
		expect(wsClient.isConnected()).toBe(false);

		// Mock successful connection
		const client = wsClient as unknown as TestWebSocketClient;
		client._connection!.readyState = MockWebSocket.OPEN;
		expect(wsClient.isConnected()).toBe(true);

		// After disconnection
		wsClient.disconnect();
		expect(wsClient.isConnected()).toBe(false);
	});
});
