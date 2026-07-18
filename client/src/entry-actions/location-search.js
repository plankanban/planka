/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const searchLocations = (cardId, query) => ({
  type: EntryActionTypes.LOCATION_SEARCH,
  payload: {
    cardId,
    query,
  },
});

const clearLocationSearch = () => ({
  type: EntryActionTypes.LOCATION_SEARCH_CLEAR,
  payload: {},
});

export default {
  searchLocations,
  clearLocationSearch,
};
