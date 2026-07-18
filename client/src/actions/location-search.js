/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const searchLocations = (cardId, query) => ({
  type: ActionTypes.LOCATION_SEARCH,
  payload: {
    cardId,
    query,
  },
});

searchLocations.success = (cardId, results) => ({
  type: ActionTypes.LOCATION_SEARCH__SUCCESS,
  payload: {
    cardId,
    results,
  },
});

searchLocations.failure = (cardId, error) => ({
  type: ActionTypes.LOCATION_SEARCH__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const clearLocationSearch = () => ({
  type: ActionTypes.LOCATION_SEARCH__CLEAR,
  payload: {},
});

export default {
  searchLocations,
  clearLocationSearch,
};
