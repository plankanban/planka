/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createApiKey = (userId) => ({
  type: EntryActionTypes.API_KEY_CREATE,
  payload: {
    userId,
  },
});

const cycleApiKey = (userId) => ({
  type: EntryActionTypes.API_KEY_CYCLE,
  payload: {
    userId,
  },
});

const deleteApiKey = (userId) => ({
  type: EntryActionTypes.API_KEY_DELETE,
  payload: {
    userId,
  },
});

export default {
  createApiKey,
  cycleApiKey,
  deleteApiKey,
};
