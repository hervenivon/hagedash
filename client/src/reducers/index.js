import { combineReducers } from 'redux';
import buzzardReducer from './buzzardReducer';

export default combineReducers({
  buzzard: buzzardReducer,
});
