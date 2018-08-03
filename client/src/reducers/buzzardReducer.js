import { extent } from 'd3-array';

import {
  WEBSOCKET_OPEN,
  WEBSOCKET_CLOSED,
  WEBSOCKET_MESSAGE,
} from '../lib/websocket/types';

import {
  WEBSOCKET_RESUMECLEARINGHISTORY,
  WEBSOCKET_PAUSECLEARINGHISTORY,
  WEBSOCKET_CLEARHISTORY,
  WEBSOCKET_LASTONE,
  WEBSOCKET_ACCUMULATION,
} from '../actions/websocketActionsTypes';

import {
  D3_SETBRUSHEXTENT,
  D3_SETZOOMINFO,
} from '../actions/d3ActionsTypes';

import { entriesToSankey } from '../lib/data';

const initialState = {
  connected: false,
  history: 5, // minutes
  accumulation: true,
  records: 0,
  data: [],
  filteredData: [],
  brushExtent: [null, null],
  info: null,
  minDate: null,
  maxDate: null,
  minFilteredDate: null,
  maxFilteredDate: null,
};

/**
 * Data filtering
 * any processing handled by the middleware @ src/reducers/websocketReducer.js
 */
function filterData(elt, currentExtent) {
  /**
   * No need to test both values of currentExtent, D3_SETBRUSHEXTENT ensures that both are null
   * or both have a date
   */
  if (currentExtent[0] === null
    || (elt.date >= currentExtent[0] && elt.date <= currentExtent[1])) {
    return true;
  }
  return false;
}

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
        connections: tmpEntry.connections,
      };
      state.data.push(newEntry);

      if (!state.accumulation) { // we want the last element only
        state.data = state.data.slice(-1);
      }

      // delete rows collected more than _history hour(s) ago
      const earliest = state.history * 60 * 1000;
      const now = new Date().getTime();
      state.data = state.data.filter(e => e.date >= (now - earliest));

      // compute all data date extent
      [state.minDate, state.maxDate] = extent(state.data, d => d.date);

      // update the number of records
      state.records = state.data.length;

      // compute filtered data
      state.filteredData = state.data.filter(e => filterData(e, state.brushExtent));
      [state.minFilteredDate, state.maxFilteredDate] = extent(state.filteredData, d => d.date);

      return Object.assign({}, state, {
        // compute sankey ready data
        ...entriesToSankey(state.filteredData),
      });
    }


    // *********************************************************************************************
    //                                     Buzzard dashboard actions
    // *********************************************************************************************

    case WEBSOCKET_CLEARHISTORY: {
      return Object.assign({}, state, {
        data: [],
        filteredData: [],
        brushExtent: [null, null],
        minDate: null,
        maxDate: null,
        minFilteredDate: null,
        maxFilteredDate: null,
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

    case WEBSOCKET_LASTONE: {
      return Object.assign({}, state, {
        accumulation: false,
      });
    }

    case WEBSOCKET_ACCUMULATION: {
      return Object.assign({}, state, {
        accumulation: true,
      });
    }

    // *********************************************************************************************
    //                          Websocket middleware actions (`src/lib/websocket`)
    // *********************************************************************************************

    case D3_SETBRUSHEXTENT: {
      try {
        const newBrushExtent = action.payload.brushExtent;

        if (newBrushExtent[0] !== state.brushExtent[0]
          || newBrushExtent[1] !== state.brushExtent[1]) { // A change occurred
          if (newBrushExtent[0] === null && newBrushExtent[1] !== null) {
            newBrushExtent[0] = new Date(newBrushExtent[1]);
          }
          if (newBrushExtent[1] === null && newBrushExtent[0] !== null) {
            newBrushExtent[1] = new Date(newBrushExtent[0]);
          }
          // compute filtered data
          state.filteredData = state.data.filter(e => filterData(e, newBrushExtent));
          [state.minFilteredDate, state.maxFilteredDate] = extent(state.filteredData, d => d.date);

          return Object.assign({}, state, {
            brushExtent: newBrushExtent,
            // compute sankey ready data
            ...entriesToSankey(state.filteredData),
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
