import { HISTORY_METHOD_CALL } from './actions';

const createRouterMiddleware = (history) => {
  // eslint-disable-next-line consistent-return
  return () => (next) => (action) => {
    if (action.type !== HISTORY_METHOD_CALL) {
      return next(action);
    }

    const {
      payload: { method, args },
    } = action;

    history[method](...args);
  };
};

export default createRouterMiddleware;
