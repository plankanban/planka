/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initialState = {
  lastAction: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, action) => {
  // Only track API key related actions to avoid storing all actions
  if (action.type.startsWith('API_KEY_') || action.type === ActionTypes.MODAL_CLOSE) {
    return {
      ...state,
      lastAction: action,
    };
  }

  return state;
};
