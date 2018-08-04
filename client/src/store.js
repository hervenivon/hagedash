import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import websocket from './lib/websocket';

export default function configureStore(/* initialState = {} */) {
  return createStore(
    rootReducer,
    // eslint-disable-next-line
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    compose(applyMiddleware(thunk),
      applyMiddleware(websocket)),
  );
}
