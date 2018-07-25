import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import websocket from './lib/websocket';

export default function configureStore(/* initialState = {} */) {
  return createStore(
    rootReducer,
    compose(applyMiddleware(thunk),
      applyMiddleware(websocket)),
  );
}
