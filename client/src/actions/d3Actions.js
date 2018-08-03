import {
  D3_SETBRUSHEXTENT,
  D3_SETZOOMINFO,
} from './d3ActionsTypes';

export const setZoomInfo = info => (dispatch) => {
  dispatch({
    type: D3_SETZOOMINFO,
    payload: {
      info,
    },
  });
};

export const setBrushExtent = (x = [null, null]) => (dispatch) => {
  dispatch({
    type: D3_SETBRUSHEXTENT,
    payload: {
      brushExtent: x,
    },
  });
};
