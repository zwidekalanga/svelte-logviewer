import type { EventSourceOptions } from '../../../types/log-viewer.js';

export interface EventSourceClientOptions {
	url: string;
	eventsourceOptions?: EventSourceOptions;
	onMessage: (message: string) => void;
	onError?: (error: Error) => void;
}

/**
 * EventSourceClient handles the connection and communication with Server-Sent Events endpoints
 */
export class EventSourceClient {
	private url: string;
	private options: EventSourceOptions;
	private connection: EventSource | null = null;
	private onMessage: (message: string) => void;
	private onError?: (error: Error) => void;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private eventCount = 0;
	private processingTimer: ReturnType<typeof setTimeout> | null = null;
	private messageQueue: string[] = [];

	/**
	 * Create a new EventSourceClient
	 * @param {EventSourceClientOptions} config - Configuration options
	 */
	constructor(config: EventSourceClientOptions) {
		this.url = config.url;
		this.options = config.eventsourceOptions || {};
		this.onMessage = config.onMessage;
		this.onError = config.onError;
	}

	/**
	 * Connect to the EventSource endpoint
	 */
	connect(): void {
		try {
			// Reset event count on new connection
			this.eventCount = 0;

			// Create EventSource with withCredentials option if provided
			this.connection = new EventSource(this.url, {
				withCredentials: this.options.withCredentials || false
			});

			this.connection.onopen = (e: Event) => {
				console.log('EventSource connection established');
				if (typeof this.options.onOpen === 'function') {
					this.options.onOpen(e, this.connection!);
				}
			};

			this.connection.onmessage = (event: MessageEvent) => {
				// Skip empty messages or messages that only contain metadata
				if (!event.data || event.data === ':ok' || event.data.trim() === '') {
					return;
				}

				let messageText: string = event.data;
				let shouldCountEvent = true;

				// Use custom formatter if provided
				if (typeof this.options.formatMessage === 'function') {
					messageText = this.options.formatMessage(event.data);
					// If the formatter returns an empty string, don't count this as an event
					if (!messageText || messageText.trim() === '') {
						shouldCountEvent = false;
					}
				} else if (typeof event.data === 'object') {
					// Try to convert object to string if not handled by formatter
					try {
						messageText = JSON.stringify(event.data);
					} catch (err) {
						console.error('Failed to stringify message data:', err);
						shouldCountEvent = false;
					}
				}

				// Only increment event count for valid, non-empty messages
				if (shouldCountEvent) {
					this.eventCount++;

					// If we've reached the maximum number of events, close the connection
					if (this.options.maxEvents !== undefined && this.eventCount >= this.options.maxEvents) {
						console.log(`Maximum events (${this.options.maxEvents}) reached, closing connection`);
						this.disconnect();
						return;
					}
				}

				// If event delay is set, queue the message instead of immediately processing it
				if (this.options.eventDelay !== undefined && this.options.eventDelay > 0) {
					// Only add non-empty messages to the queue
					if (messageText && messageText.trim() !== '') {
						this.messageQueue.push(messageText);

						// If we're not already processing the queue, start processing
						if (!this.processingTimer) {
							this.processMessageQueue();
						}
					}
				} else {
					// Only pass non-empty messages to the caller
					if (messageText && messageText.trim() !== '') {
						this.onMessage(messageText);
					}
				}
			};

			this.connection.onerror = (e: Event) => {
				console.error('EventSource error:', e);
				if (typeof this.options.onError === 'function') {
					this.options.onError(e);
				}

				if (this.onError) {
					this.onError(new Error('EventSource connection error'));
				}

				// Auto-reconnect logic
				// Unlike WebSocket, EventSource automatically reconnects,
				// but we can implement custom reconnect logic if needed
				if (this.options.reconnect === false) {
					// Only if explicitly set to false, disconnect
					this.disconnect();
				} else if (this.options.reconnect === true && !this.connection) {
					// Only reconnect manually if reconnect is explicitly true and connection is closed
					const reconnectWait = this.options.reconnectWait || 1;
					console.log(`Attempting to reconnect in ${reconnectWait}s...`);

					this.reconnectTimer = setTimeout(() => {
						this.connect();
					}, reconnectWait * 1000);
				}
			};

			// Add custom event listeners if defined
			if (this.options.onClose) {
				// EventSource doesn't have an onclose event, so we need to handle it ourselves
				// Usually this won't be needed as EventSource tries to reconnect automatically
				window.addEventListener('beforeunload', () => {
					if (this.connection && typeof this.options.onClose === 'function') {
						this.options.onClose(new Event('close'));
					}
				});
			}
		} catch (error) {
			console.error('Error setting up EventSource:', error);
			if (this.onError) {
				this.onError(error instanceof Error ? error : new Error(String(error)));
			}
		}
	}

	/**
	 * Add an event listener for a specific event type
	 * EventSource can listen to specific named events
	 *
	 * @param {string} eventName - The name of the event to listen for
	 * @param {Function} callback - Callback function to handle the event
	 */
	addEventTypeListener(eventName: string, callback: (event: MessageEvent) => void): void {
		if (!this.connection) {
			console.error('Cannot add event listener: EventSource is not connected');
			return;
		}

		this.connection.addEventListener(eventName, callback as EventListener);
	}

	/**
	 * Remove an event listener for a specific event type
	 *
	 * @param {string} eventName - The name of the event to remove the listener for
	 * @param {Function} callback - The callback function to remove
	 */
	removeEventTypeListener(eventName: string, callback: (event: MessageEvent) => void): void {
		if (!this.connection) {
			console.error('Cannot remove event listener: EventSource is not connected');
			return;
		}

		this.connection.removeEventListener(eventName, callback as EventListener);
	}

	/**
	 * Process messages in the queue with delay
	 */
	private processMessageQueue(): void {
		if (this.messageQueue.length === 0) {
			this.processingTimer = null;
			return;
		}

		const message = this.messageQueue.shift();
		if (message) {
			this.onMessage(message);
		}

		// Schedule processing of the next message after the delay
		this.processingTimer = setTimeout(() => {
			this.processMessageQueue();
		}, this.options.eventDelay || 500);
	}

	/**
	 * Disconnect from the EventSource
	 */
	disconnect(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.processingTimer) {
			clearTimeout(this.processingTimer);
			this.processingTimer = null;
			this.messageQueue = []; // Clear any pending messages
		}

		if (this.connection) {
			this.connection.close();
			this.connection = null;
		}
	}

	/**
	 * Check if the client is connected
	 */
	isConnected(): boolean {
		return !!this.connection && this.connection.readyState === EventSource.OPEN;
	}
}

export default EventSourceClient;
