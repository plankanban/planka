/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  results: null,
  isSearching: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.LOCATION_SEARCH:
      return {
        ...state,
        isSearching: true,
        error: null,
      };
    case ActionTypes.LOCATION_SEARCH__SUCCESS:
      return {
        ...state,
        results: payload.results,
        isSearching: false,
        error: null,
      };
    case ActionTypes.LOCATION_SEARCH__FAILURE:
      return {
        ...state,
        isSearching: false,
        error: payload.error,
      };
    case ActionTypes.LOCATION_SEARCH__CLEAR:
      return initialState;
    default:
      return state;
  }
};
