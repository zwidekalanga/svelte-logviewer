import type { WebSocket } from 'ws';

export interface MarketData {
    bid: number;
    ask: number;
    lastPrice: number;
}

export interface WebSocketHandlers {
    onOpen?: (e: Event, socket: WebSocket) => void;
    onMessage?: (data: MarketData) => string;
    onClose?: (e: CloseEvent) => void;
    onError?: (e: Event) => void;
} 