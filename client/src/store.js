import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';

import rootReducer from './reducers';
import rootSaga from './sagas';
import history from './history';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware, routerMiddleware(history)];

if (process.env.NODE_ENV !== 'production') {
  const { logger } = require('redux-logger'); // eslint-disable-line global-require

  middlewares.push(logger);
}

export default createStore(rootReducer, applyMiddleware(...middlewares));

sagaMiddleware.run(rootSaga);
