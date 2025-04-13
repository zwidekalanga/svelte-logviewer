import ConnectionClient from './connection-client.js';

import type { ConnectionClientOptions } from './connection-client.js';
import type { EventSourceOptions } from '../../../lib/types/log-viewer.js';

export interface EventSourceClientOptions extends ConnectionClientOptions {
	eventsourceOptions?: EventSourceOptions;
}

/**
 * EventSourceClient handles the connection and communication with Server-Sent Events endpoints
 */
export class EventSourceClient extends ConnectionClient {
	private connection: EventSource | null = null;
	private eventCount = 0;
	private processingTimer: ReturnType<typeof setTimeout> | null = null;
	private messageQueue: string[] = [];
	private emptyEventCounter = 0;
	private maxEmptyEvents = 100; // Default threshold

	/**
	 * Create a new EventSourceClient
	 * @param {EventSourceClientOptions} config - Configuration options
	 */
	constructor(config: EventSourceClientOptions) {
		super({
			url: config.url,
			options: config.eventsourceOptions || {},
			onMessage: config.onMessage,
			onError: config.onError
		});

		// Set custom threshold if provided
		if ((this.options as EventSourceOptions).maxEmptyEvents) {
			this.maxEmptyEvents = (this.options as EventSourceOptions).maxEmptyEvents;
		}
	}

	/**
	 * Connect to the EventSource endpoint
	 */
	connect(): void {
		try {
			// Reset event count and empty event counter on new connection
			this.eventCount = 0;
			this.emptyEventCounter = 0;

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
					this.emptyEventCounter++;

					// If receiving too many empty events, disconnect to prevent browser crash
					if (this.emptyEventCounter > this.maxEmptyEvents) {
						console.warn(
							`Received ${this.emptyEventCounter} consecutive empty events, disconnecting`
						);
						this.disconnect();

						// Notify of error
						this.handleConnectionError(
							new Error(`EventSource disconnected after ${this.emptyEventCounter} empty events`)
						);
						return;
					}

					return;
				}

				// Reset empty event counter when we get a valid message
				this.emptyEventCounter = 0;

				// Format the message using the base class method
				const messageText: string = this.formatMessageData(event.data);
				let shouldCountEvent = true;

				// If the formatter returns an empty string, don't count this as an event
				if (!messageText || messageText.trim() === '') {
					shouldCountEvent = false;
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

				this.handleConnectionError(new Error('EventSource connection error'));

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
			this.handleConnectionError(error instanceof Error ? error : new Error(String(error)));
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
