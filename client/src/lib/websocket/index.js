/* eslint-env browser */

/**
 * Inspired from:
 * - https://github.com/giantmachines/redux-websocket/pull/8/files
 * - https://gist.github.com/dmichael/9dc767fca93624df58b423d01e485402
 */

import { compose } from 'redux';
import partial from 'lodash/fp/partial';
import partialRight from 'lodash/fp/partialRight';
import { connecting, open, closed, message } from './actions';
import { createWebsocket } from './websocket';
import { WEBSOCKET_CONNECT,
         WEBSOCKET_DISCONNECT,
         WEBSOCKET_SEND,
         WEBSOCKET_OPEN,
         WEBSOCKET_CLOSED } from './types';

const createMiddleware = () => {
  // Hold a reference to the WebSocket instance in use.
  let websocket;
  let websocketConfig;

  /**
   * A function to create the WebSocket object and attach the standard callbacks
   */
  const initialize = ({ dispatch }, config) => {
    // Instantiate the websocket.
    websocket = createWebsocket(config);
    websocketConfig = config

    // Function will dispatch actions returned from action creators.
    const dispatchAction = partial(compose, [dispatch]);

    // Setup handlers to be called like this:
    // dispatch(open(event));
    websocket.onopen = dispatchAction(open);
    websocket.onclose = dispatchAction(closed);
    websocket.onmessage = dispatchAction(message);

    // An optimistic callback assignment for WebSocket objects that support this
    const onConnecting = dispatchAction(connecting);
    // Add the websocket as the 2nd argument (after the event).
    websocket.onconnecting = partialRight(onConnecting, [websocket]);
  };

  /**
   * Close the WebSocket connection and cleanup
   */
  const close = () => {
    if (websocket) {
      console.warn(`Closing WebSocket connection to ${websocket.url} ...`);
      websocket.close();
      websocket = null;
    }
  };

  let attempts = 1;
  let automaticReconnect = true;
  const generateInterval = (k) => Math.min(30, (Math.pow(2, k) - 1)) * 1000;

  /**
   * The primary Redux middleware function.
   * Each of the actions handled are user-dispatched.
   */
  return (store) => (next) => (action) => {
    switch (action.type) {
      // User request to connect
      case WEBSOCKET_CONNECT:
        close();
        initialize(store, action.payload);

        automaticReconnect = true;
        next(action);
        break;

      // User request to disconnect
      case WEBSOCKET_DISCONNECT:
        close();
        if (action && action.payload && action.payload.hasOwnProperty('automaticReconnect')) {
          automaticReconnect = action.payload.automaticReconnect;
        } else {
          automaticReconnect = true;
        }

        next(action);
        break;

      // User request to send a message
      case WEBSOCKET_SEND:
        if (websocket) {
          websocket.send(JSON.stringify(action.payload));
        } else {
          console.warn('WebSocket is closed, ignoring. Trigger a WEBSOCKET_CONNECT first.');
        }
        next(action);
        break;

      case WEBSOCKET_OPEN:
        attempts = 1
        next(action)
        break

      case WEBSOCKET_CLOSED:
        const time = generateInterval(attempts);

        if (automaticReconnect) {
          setTimeout(() => {
            attempts++; // Increment attempts by 1 as we have tried  to reconnect
            console.log(websocketConfig, websocketConfig.url)
            initialize(store, websocketConfig)
          }, time)
        }
        next(action)
        break
      default:
        next(action);
    }
  };
};

export default createMiddleware();