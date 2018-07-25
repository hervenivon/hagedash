/* eslint-env browser */

/**
 * Formats args for creating the WebSocket instance
 */
const extractArgs = (config) => {
  if (config.args) {
    return config.args;
  }

  if (config.url) {
    return [config.url];
  }

  return [];
};


/**
 * Create a websocket object from the incoming config
 */
const createWebsocket = (payload) => {
  const args = extractArgs(payload);
  const GoodWebsocket = (payload.websocket) ? payload.websocket : WebSocket;

  return new GoodWebsocket(...args);
};

export { createWebsocket as default };
