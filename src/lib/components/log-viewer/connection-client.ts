// Define interfaces
interface ConnectionOptions {
	// Common options
	onOpen?: ((e: Event, connection: never) => void) | undefined;
	onClose?: ((e: Event) => void) | undefined;
	onError?: ((e: Event) => void) | undefined;
	formatMessage?: ((message: unknown) => string) | undefined;
	reconnect?: boolean;
	reconnectWait?: number;
}

interface ConnectionClientOptions {
	url: string;
	options?: ConnectionOptions;
	onMessage: (message: string) => void;
	onError?: (error: Error) => void;
}

// Define abstract class
abstract class ConnectionClient {
	protected url: string;
	protected options: ConnectionOptions;
	protected onMessage: (message: string) => void;
	protected onError?: (error: Error) => void;
	protected reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	protected constructor(config: ConnectionClientOptions) {
		this.url = config.url;
		this.options = config.options || {};
		this.onMessage = config.onMessage;
		this.onError = config.onError;
	}

	abstract connect(): void;
	abstract disconnect(): void;
	abstract isConnected(): boolean;

	protected handleConnectionError(error: Error): void {
		console.error(`Connection error:`, error);
		if (this.onError) {
			this.onError(error);
		}
	}

	protected formatMessageData(data: never): string {
		let messageText: string = data;

		// Use custom formatter if provided
		if (typeof this.options.formatMessage === 'function') {
			messageText = this.options.formatMessage(data);
		} else if (typeof data === 'object') {
			// Try to convert object to string if not handled by formatter
			try {
				messageText = JSON.stringify(data);
			} catch (err) {
				console.error('Failed to stringify message data:', err);
			}
		}

		return messageText;
	}
}

// Export everything as named exports
export { ConnectionClient };
export type { ConnectionClientOptions, ConnectionOptions };

// Also provide a default export for compatibility
export default ConnectionClient;
