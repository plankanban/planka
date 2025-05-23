/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const LOCATION_CHANGE_HANDLE = '@@router/LOCATION_CHANGE_HANDLE';

export const handleLocationChange = (location, action, isFirstRendering = false) => ({
  type: LOCATION_CHANGE_HANDLE,
  payload: {
    location,
    action,
    isFirstRendering,
  },
});

export const HISTORY_METHOD_CALL = '@@router/HISTORY_METHOD_CALL';

const createHistoryMethodCaller = (method) => {
  return (...args) => ({
    type: HISTORY_METHOD_CALL,
    payload: {
      method,
      args,
    },
  });
};

export const push = createHistoryMethodCaller('push');
export const replace = createHistoryMethodCaller('replace');
export const go = createHistoryMethodCaller('go');
export const back = createHistoryMethodCaller('back');
export const forward = createHistoryMethodCaller('forward');
