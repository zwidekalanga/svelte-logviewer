import type { WebsocketOptions } from '../../../types/log-viewer.js';

export interface WebSocketClientOptions {
  url: string;
  websocketOptions?: WebsocketOptions;
  onMessage: (message: string) => void;
  onError?: (error: Error) => void;
}

/**
 * WebSocketClient handles the connection and communication with WebSocket endpoints
 */
export class WebSocketClient {
  private url: string;
  private options: WebsocketOptions;
  private connection: WebSocket | null = null;
  private onMessage: (message: string) => void;
  private onError?: (error: Error) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Create a new WebSocketClient
   * @param {WebSocketClientOptions} config - Configuration options
   */
  constructor(config: WebSocketClientOptions) {
    this.url = config.url;
    this.options = config.websocketOptions || {};
    this.onMessage = config.onMessage;
    this.onError = config.onError;
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
        let messageText: string = event.data;
        
        // Use custom formatter if provided
        if (typeof this.options.formatMessage === 'function') {
          messageText = this.options.formatMessage(event.data);
        } else if (typeof event.data === 'object') {
          // Try to convert object to string if not handled by formatter
          try {
            messageText = JSON.stringify(event.data);
          } catch (err) {
            console.error('Failed to stringify message data:', err);
          }
        }
        
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
        
        if (this.onError) {
          this.onError(new Error('WebSocket connection error'));
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
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