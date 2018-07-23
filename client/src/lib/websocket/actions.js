/* eslint-env browser */
import { WEBSOCKET_CONNECTING, WEBSOCKET_OPEN, WEBSOCKET_CLOSED, WEBSOCKET_MESSAGE } from './types';

// These actions are more concerned with connection state
// and are trigged async by the WebSocketMiddleware

export const connecting = (event, websocket) => ({
  type: WEBSOCKET_CONNECTING,
  payload: {
    timestamp: new Date(),
    event,
    websocket
  }
});

export const open = (event) => ({
  type: WEBSOCKET_OPEN,
  payload: {
    timestamp: new Date(),
    event
  }
});

export const closed = (event) => ({
  type: WEBSOCKET_CLOSED,
  payload: {
    timestamp: new Date(),
    event
  }
});

export const message = (event) => ({
  type: WEBSOCKET_MESSAGE,
  payload: {
    timestamp: new Date(),
    data: event.data,
    event
  }
});

export default {};