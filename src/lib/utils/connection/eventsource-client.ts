import ConnectionClient from './connection-client.js';

import type { ConnectionClientOptions } from './connection-client.js';
import type { EventSourceOptions } from '../../../types/lazylog.js';

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
			this.resetConnectionState();
			this.initializeEventSource();
			this.attachEventHandlers();
			this.setupCustomListeners();
		} catch (error) {
			console.error('Error setting up EventSource:', error);
			this.handleConnectionError(error instanceof Error ? error : new Error(String(error)));
		}
	}

	/**
	 * Reset connection state before establishing a new connection
	 */
	private resetConnectionState(): void {
		this.eventCount = 0;
		this.emptyEventCounter = 0;
	}

	/**
	 * Initialize the EventSource connection
	 */
	private initializeEventSource(): void {
		this.connection = new EventSource(this.url, {
			withCredentials: (this.options as EventSourceOptions).withCredentials || false
		});
	}

	/**
	 * Attach event handlers to the EventSource
	 */
	private attachEventHandlers(): void {
		if (!this.connection) return;

		this.connection.onopen = this.handleOpen.bind(this);
		this.connection.onmessage = this.handleMessage.bind(this);
		this.connection.onerror = this.handleError.bind(this);
	}

	/**
	 * Handle connection open event
	 */
	private handleOpen(e: Event): void {
		console.log('EventSource connection established.');
		if (typeof this.options.onOpen === 'function') {
			this.options.onOpen(e, this.connection!);
		}
	}

	/**
	 * Handle incoming messages
	 */
	private handleMessage(event: MessageEvent): void {
		if (this.isEmptyMessage(event.data)) {
			this.handleEmptyMessage();
			return;
		}

		// Reset empty event counter when we get a valid message
		this.emptyEventCounter = 0;

		// Process the non-empty message
		this.processMessage(event.data);
	}

	/**
	 * Check if a message is empty or just metadata
	 */
	private isEmptyMessage(data: string): boolean {
		return !data || data === ':ok' || data.trim() === '';
	}

	/**
	 * Handle an empty message
	 */
	private handleEmptyMessage(): void {
		this.emptyEventCounter++;

		// If receiving too many empty events, disconnect to prevent browser crash
		if (this.emptyEventCounter > this.maxEmptyEvents) {
			console.warn(`Received ${this.emptyEventCounter} consecutive empty events, disconnecting`);
			this.disconnect();

			// Notify of error
			this.handleConnectionError(
				new Error(`EventSource disconnected after ${this.emptyEventCounter} empty events`)
			);
		}
	}

	/**
	 * Process a valid message
	 */
	private processMessage(data: string): void {
		// Format the message using the base class method
		const messageText: string = this.formatMessageData(data);

		// Skip empty formatted messages
		if (!messageText || messageText.trim() === '') {
			return;
		}

		// Update event counter and check max events
		this.updateEventCounter();

		// Either queue or immediately process the message
		this.deliverMessage(messageText);
	}

	/**
	 * Update event counter and check if max events reached
	 */
	private updateEventCounter(): void {
		this.eventCount++;

		// If we've reached the maximum number of events, close the connection
		const maxEvents = (this.options as EventSourceOptions).maxEvents;
		if (maxEvents !== undefined && this.eventCount >= maxEvents) {
			console.log(`Maximum events (${maxEvents}) reached, closing connection`);
			this.disconnect();
		}
	}

	/**
	 * Deliver a message to the client, either immediately or through queue
	 */
	private deliverMessage(messageText: string): void {
		// If event delay is set, queue the message
		const eventDelay = (this.options as EventSourceOptions).eventDelay;
		if (eventDelay !== undefined && eventDelay > 0) {
			this.messageQueue.push(messageText);

			// If we're not already processing the queue, start processing
			if (!this.processingTimer) {
				this.processMessageQueue();
			}
		} else {
			// Otherwise process immediately
			this.onMessage(messageText);
		}
	}

	/**
	 * Handle connection error
	 */
	private handleError(e: Event): void {
		console.error('EventSource error:', e);
		if (typeof this.options.onError === 'function') {
			this.options.onError(e);
		}

		this.handleConnectionError(new Error('EventSource connection error'));
		this.handleReconnection();
	}

	/**
	 * Handle reconnection logic
	 */
	private handleReconnection(): void {
		// Auto-reconnect logic
		// Unlike WebSocket, EventSource automatically reconnects,
		// but we can implement custom reconnect logic if needed
		if (this.options.reconnect === false) {
			// Only if explicitly set to false, disconnect
			this.disconnect();
		} else if (this.options.reconnect === true && !this.connection) {
			// Only reconnect manually if reconnect is explicitly true and connection is closed
			this.scheduleReconnect();
		}
	}

	/**
	 * Schedule a reconnection attempt
	 */
	private scheduleReconnect(): void {
		const reconnectWait = this.options.reconnectWait || 1;
		console.log(`Attempting to reconnect in ${reconnectWait}s...`);

		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, reconnectWait * 1000);
	}

	/**
	 * Set up custom event listeners
	 */
	private setupCustomListeners(): void {
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
		this.processingTimer = setTimeout(
			() => {
				this.processMessageQueue();
			},
			(this.options as EventSourceOptions).eventDelay || 500
		);
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
