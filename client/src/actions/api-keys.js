/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createApiKey = (userId) => ({
  type: ActionTypes.API_KEY_CREATE,
  payload: {
    userId,
  },
});

createApiKey.success = (userId, apiKey) => ({
  type: ActionTypes.API_KEY_CREATE__SUCCESS,
  payload: {
    userId,
    apiKey,
  },
});

createApiKey.failure = (userId, error) => ({
  type: ActionTypes.API_KEY_CREATE__FAILURE,
  payload: {
    userId,
    error,
  },
});

const cycleApiKey = (userId) => ({
  type: ActionTypes.API_KEY_CYCLE,
  payload: {
    userId,
  },
});

cycleApiKey.success = (userId, apiKey) => ({
  type: ActionTypes.API_KEY_CYCLE__SUCCESS,
  payload: {
    userId,
    apiKey,
  },
});

cycleApiKey.failure = (userId, error) => ({
  type: ActionTypes.API_KEY_CYCLE__FAILURE,
  payload: {
    userId,
    error,
  },
});

const deleteApiKey = (userId) => ({
  type: ActionTypes.API_KEY_DELETE,
  payload: {
    userId,
  },
});

deleteApiKey.success = (userId) => ({
  type: ActionTypes.API_KEY_DELETE__SUCCESS,
  payload: {
    userId,
  },
});

deleteApiKey.failure = (userId, error) => ({
  type: ActionTypes.API_KEY_DELETE__FAILURE,
  payload: {
    userId,
    error,
  },
});

export default {
  createApiKey,
  cycleApiKey,
  deleteApiKey,
};
