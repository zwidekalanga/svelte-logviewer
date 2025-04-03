import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClient } from '../websocket-client.js';

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  
  url: string;
  readyState: number = MockWebSocket.CLOSED;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  
  constructor(url: string) {
    this.url = url;
    this.readyState = MockWebSocket.CLOSED;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen({});
    }, 0);
  }
  
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
    const connectSpy = vi.spyOn(wsClient as any, 'connect');
    wsClient.connect();
    expect(connectSpy).toHaveBeenCalled();
  });
  
  it('should handle incoming messages', () => {
    wsClient.connect();
    
    // Access the private connection property for testing
    const connection = (wsClient as any).connection;
    connection.onmessage?.({ data: 'test message' });
    
    expect(mockOnMessage).toHaveBeenCalledWith('test message');
  });
  
  it('should format object messages', () => {
    wsClient.connect();
    
    const connection = (wsClient as any).connection;
    const testObj = { test: 'data' };
    connection.onmessage?.({ data: testObj });
    
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
    
    const connection = (wsClient as any).connection;
    connection.onmessage?.({ data: 'raw message' });
    
    expect(customFormatter).toHaveBeenCalledWith('raw message');
    expect(mockOnMessage).toHaveBeenCalledWith('formatted message');
  });
  
  it('should handle connection errors', () => {
    wsClient.connect();
    
    const connection = (wsClient as any).connection;
    connection.onerror?.({ message: 'connection error' });
    
    expect(mockOnError).toHaveBeenCalled();
  });
  
  it('should handle disconnection', () => {
    wsClient.connect();
    
    // Mock successful connection
    (wsClient as any).connection.readyState = MockWebSocket.OPEN;
    
    const closeSpy = vi.spyOn((wsClient as any).connection, 'close');
    wsClient.disconnect(1000, 'test reason');
    
    expect(closeSpy).toHaveBeenCalledWith(1000, 'test reason');
    expect((wsClient as any).connection).toBeNull();
  });
  
  it('should report connection status correctly', () => {
    wsClient.connect();
    
    // Initially not connected
    expect(wsClient.isConnected()).toBe(false);
    
    // Mock successful connection
    (wsClient as any).connection.readyState = MockWebSocket.OPEN;
    expect(wsClient.isConnected()).toBe(true);
    
    // After disconnection
    wsClient.disconnect();
    expect(wsClient.isConnected()).toBe(false);
  });
}); 