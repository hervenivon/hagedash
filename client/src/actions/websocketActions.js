import { WEBSOCKET_CONNECT, WEBSOCKET_DISCONNECT } from '../lib/websocket/types';

import {
  WEBSOCKET_RESUMECLEARINGHISTORY,
  WEBSOCKET_PAUSECLEARINGHISTORY,
  WEBSOCKET_CLEARHISTORY,
  WEBSOCKET_LASTONE,
  WEBSOCKET_ACCUMULATION,
} from './websocketActionsTypes';

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

export const lastOne = () => (dispatch) => {
  dispatch({
    type: WEBSOCKET_LASTONE,
    payload: {},
  });
};

export const accumulation = () => (dispatch) => {
  dispatch({
    type: WEBSOCKET_ACCUMULATION,
    payload: {},
  });
};
