/**
 * @typedef {Object} LogViewerProps
 * @property {string} [text] - Log text content
 * @property {boolean} [external] - Whether to use external mode
 * @property {boolean} [websocket] - Whether to use WebSocket
 * @property {string} [url] - URL for WebSocket or EventSource connection
 * @property {Object} [websocketOptions] - WebSocket options
 * @property {boolean} [eventsource] - Whether to use EventSource
 * @property {Object} [eventsourceOptions] - EventSource options
 * @property {boolean} [follow] - Whether to follow logs
 * @property {string} [height] - Container height
 * @property {number|number[]} [highlight] - Line number(s) to highlight
 */

/**
 * @typedef {Object} WebsocketOptions
 * @property {boolean} [reconnect] - Whether to reconnect on close
 * @property {number} [reconnectWait] - Seconds to wait before reconnecting
 * @property {Function} [formatMessage] - Function to format messages
 * @property {Function} [onOpen] - Callback when connection opens
 * @property {Function} [onClose] - Callback when connection closes
 * @property {Function} [onError] - Callback when error occurs
 */

/**
 * @typedef {Object} EventSourceOptions
 * @property {boolean} [withCredentials] - Whether to send credentials
 * @property {Function} [onOpen] - Callback when connection opens
 * @property {Function} [onClose] - Callback when connection closes
 * @property {Function} [onError] - Callback when error occurs
 * @property {Function} [formatMessage] - Function to format messages
 * @property {boolean} [reconnect] - Whether to reconnect on close
 * @property {number} [reconnectWait] - Seconds to wait before reconnecting
 * @property {number} [maxEvents] - Maximum number of events to receive
 * @property {number} [eventDelay] - Delay between processing events
 */

export {};
