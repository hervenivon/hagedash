import {
  WEBSOCKET_OPEN,
  WEBSOCKET_CLOSED,
  WEBSOCKET_MESSAGE,
} from '../lib/websocket/types';

import {
  WEBSOCKET_RESUMECLEARINGHISTORY,
  WEBSOCKET_PAUSECLEARINGHISTORY,
  WEBSOCKET_CLEARHISTORY,
} from '../actions/websocketActionsTypes';

import {
  D3_SETBRUSHEXTENT,
  D3_SETZOOMINFO,
} from '../actions/d3ActionsTypes';

const initialState = {
  connected: false,
  history: 5, // minutes
  records: 0,
  data: [],
  brushExtent: [null, null],
  info: null,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    // *********************************************************************************************
    //                          Websocket middleware actions (`src/lib/websocket`)
    // *********************************************************************************************

    case WEBSOCKET_OPEN: {
      // eslint-disable-next-line
      console.debug('Websocket connection open');
      return Object.assign({}, state, {
        connected: true,
      });
    }

    case WEBSOCKET_CLOSED: {
      // eslint-disable-next-line
      console.debug('Websocket connection closed');
      return Object.assign({}, state, {
        connected: false,
      });
    }

    case WEBSOCKET_MESSAGE: {
      const tmpEntry = JSON.parse(action.payload.data);
      const newEntry = {
        date: new Date(tmpEntry.time * 1000), // We are receiving Unix Timestamp
        pools: tmpEntry.pools,
        nbrPools: Object.keys(tmpEntry.pools).length,
        rasters: tmpEntry.rasters,
        nbrRasters: Object.keys(tmpEntry.rasters).length,
        queries: tmpEntry.queries,
        nbrQueries: Object.keys(tmpEntry.queries).length,
      };
      state.data.push(newEntry);

      // delete rows collected more than _history hour(s) ago
      const earliest = state.history * 60 * 1000;
      const now = new Date().getTime();

      state.data = state.data.filter(e => e.date >= (now - earliest));

      // update the number of records
      state.records = state.data.length;
      return Object.assign({}, state);
    }


    // *********************************************************************************************
    //                                     Buzzard dashboard actions
    // *********************************************************************************************

    case WEBSOCKET_CLEARHISTORY: {
      return Object.assign({}, state, {
        data: [],
      });
    }

    /**
     *
     * Clear the data stored
     */
    case WEBSOCKET_PAUSECLEARINGHISTORY: {
      return Object.assign({}, state, {
        history: Infinity,
      });
    }

    case WEBSOCKET_RESUMECLEARINGHISTORY: {
      let history = null;

      try {
        history = parseInt(action.payload.history, 10);
      } catch (e) {
        ({ history } = initialState);
      }

      return Object.assign({}, state, {
        history: history || initialState.history,
      });
    }


    // *********************************************************************************************
    //                          Websocket middleware actions (`src/lib/websocket`)
    // *********************************************************************************************

    case D3_SETBRUSHEXTENT: {
      try {
        const newBrushExtent = action.payload.brushExtent;

        if (newBrushExtent[0] !== state.brushExtent[0]
            || newBrushExtent[1] !== state.brushExtent[1]) {
          return Object.assign({}, state, {
            brushExtent: newBrushExtent,
          });
        }
        return state;
      } catch (e) {
        return state;
      }
    }

    case D3_SETZOOMINFO: {
      const newState = Object.assign({}, state, {
        info: action.payload.info,
      });

      if (action.payload.info || action.payload.info !== state.info) {
        return newState;
      }
      return state;
    }

    // *********************************************************************************************
    //                                        Default
    // *********************************************************************************************

    default: {
      return state;
    }
  }
};
