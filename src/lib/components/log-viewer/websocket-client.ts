import type { WebsocketOptions } from '../../../lib/types/log-viewer.js';
import ConnectionClient from './connection-client.js';
import type { ConnectionClientOptions } from './connection-client.js';

export interface WebSocketClientOptions extends ConnectionClientOptions {
	websocketOptions?: WebsocketOptions;
}

/**
 * WebSocketClient handles the connection and communication with WebSocket endpoints
 */
export class WebSocketClient extends ConnectionClient {
	private connection: WebSocket | null = null;

	/**
	 * Create a new WebSocketClient
	 * @param {WebSocketClientOptions} config - Configuration options
	 */
	constructor(config: WebSocketClientOptions) {
		super({
			url: config.url,
			options: config.websocketOptions || {},
			onMessage: config.onMessage,
			onError: config.onError
		});
	}

	/**
	 * Connect to the WebSocket endpoint
	 */
	connect(): void {
		try {
			this.connection = new WebSocket(this.url);

			this.connection.onopen = (e: Event) => {
				console.log('WebSocket connection established');
				if (typeof this.options.onOpen === 'function') {
					this.options.onOpen(e, this.connection!);
				}
			};

			this.connection.onmessage = (event: MessageEvent) => {
				// Format the message using the base class method
				const messageText = this.formatMessageData(event.data);

				// Pass the message to the caller
				this.onMessage(messageText);
			};

			this.connection.onclose = (e: CloseEvent) => {
				console.log('WebSocket connection closed');
				if (typeof this.options.onClose === 'function') {
					this.options.onClose(e);
				}

				// Auto-reconnect logic
				if (this.options.reconnect) {
					const reconnectWait = this.options.reconnectWait || 1;
					console.log(`Attempting to reconnect in ${reconnectWait}s...`);

					this.reconnectTimer = setTimeout(() => {
						this.connect();
					}, reconnectWait * 1000);
				}
			};

			this.connection.onerror = (e: Event) => {
				console.error('WebSocket error:', e);
				if (typeof this.options.onError === 'function') {
					this.options.onError(e);
				}

				this.handleConnectionError(new Error('WebSocket connection error'));
			};
		} catch (error) {
			console.error('Error setting up WebSocket:', error);
			this.handleConnectionError(error instanceof Error ? error : new Error(String(error)));
		}
	}

	/**
	 * Send data to the WebSocket server
	 * @param {string|object} data - Data to send
	 */
	send(data: string | object): boolean {
		if (!this.connection || this.connection.readyState !== WebSocket.OPEN) {
			console.error('Cannot send: WebSocket is not connected');
			return false;
		}

		try {
			const payload = typeof data === 'object' ? JSON.stringify(data) : data;
			this.connection.send(payload);
			return true;
		} catch (error) {
			console.error('Failed to send message:', error);
			return false;
		}
	}

	/**
	 * Disconnect from the WebSocket server
	 * @param {number} code - Close code
	 * @param {string} reason - Close reason
	 */
	disconnect(code: number = 1000, reason: string = 'Client disconnected'): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.connection) {
			this.connection.close(code, reason);
			this.connection = null;
		}
	}

	/**
	 * Check if the client is connected
	 */
	isConnected(): boolean {
		return !!this.connection && this.connection.readyState === WebSocket.OPEN;
	}
}

export default WebSocketClient;
