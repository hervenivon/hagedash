import { WEBSOCKET_CONNECT, WEBSOCKET_DISCONNECT } from '../lib/websocket/types';

import {
  WEBSOCKET_RESUMECLEARINGHISTORY,
  WEBSOCKET_PAUSECLEARINGHISTORY,
  WEBSOCKET_CLEARHISTORY,
} from './websocketActionsTypes';

export const simpleAction = () => (dispatch) => {
  dispatch({
    type: 'SIMPLE_ACTION',
    payload: 'result_of_simple_action',
  });
};

export const connectAction = () => (dispatch) => {
  dispatch({
    type: WEBSOCKET_CONNECT,
    payload: {
      url: 'ws://localhost:8001/websocket',
    },
  });
};

export const disconnectAction = () => (dispatch) => {
  dispatch({
    type: WEBSOCKET_DISCONNECT,
    payload: {
      automaticReconnect: false,
    },
  });
};

export const clearHistoryAction = () => (dispatch) => {
  dispatch({
    type: WEBSOCKET_CLEARHISTORY,
    payload: {},
  });
};

export const pauseClearingHistory = () => (dispatch) => {
  dispatch({
    type: WEBSOCKET_PAUSECLEARINGHISTORY,
    payload: {},
  });
};

export const resumeClearingHistory = () => (dispatch) => {
  dispatch({
    type: WEBSOCKET_RESUMECLEARINGHISTORY,
    payload: {},
  });
};
