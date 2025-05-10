/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { applyMiddleware, legacy_createStore as createStore, compose as reduxCompose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createRouterMiddleware } from './lib/redux-router';

import rootReducer from './reducers';
import rootSaga from './sagas';
import history from './history';

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware, createRouterMiddleware(history)];

let compose = reduxCompose;
if (import.meta.env.DEV) {
  middlewares.push(require('redux-logger')); // eslint-disable-line global-require

  // Enable Redux Devtools in development
  // https://github.com/zalmoxisus/redux-devtools-extension
  if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== 'undefined') {
    compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
}

export default createStore(rootReducer, compose(applyMiddleware(...middlewares)));

sagaMiddleware.run(rootSaga);
