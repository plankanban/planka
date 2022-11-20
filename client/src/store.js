import { applyMiddleware, legacy_createStore as createStore, compose as reduxCompose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './reducers';
import rootSaga from './sagas';
import { createReduxHistory, routerMiddleware } from './redux-history-context';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware, routerMiddleware];

let compose = reduxCompose;

if (process.env.NODE_ENV !== 'production') {
  const { logger } = require('redux-logger'); // eslint-disable-line global-require
  middlewares.push(logger);

  // Enable Redux Devtools in development
  // https://github.com/zalmoxisus/redux-devtools-extension
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== 'undefined') {
    compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
}

const store = createStore(rootReducer, compose(applyMiddleware(...middlewares)));

sagaMiddleware.run(rootSaga);

export default store;

export const history = createReduxHistory(store);
