import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// replace the default bootstrap them with flatly from https://bootswatch.com/
// import 'bootstrap/dist/css/bootstrap.min.css';
import './vendors/bootswatch/bootstrap.css';
import configureStore from './store';
import './index.css';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

registerServiceWorker();
