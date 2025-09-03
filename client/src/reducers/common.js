/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initialState = {
  isInitializing: true,
  config: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.SOCKET_RECONNECT_HANDLE:
      return {
        ...state,
        config: payload.config,
      };
    case ActionTypes.LOGIN_INITIALIZE:
      return {
        ...state,
        isInitializing: false,
        config: payload.config,
      };
    case ActionTypes.AUTHENTICATE__SUCCESS:
    case ActionTypes.WITH_OIDC_AUTHENTICATE__SUCCESS:
    case ActionTypes.TERMS_ACCEPT__SUCCESS:
      return {
        ...state,
        isInitializing: true,
      };
    case ActionTypes.CORE_INITIALIZE:
      return {
        ...state,
        isInitializing: false,
      };
    case ActionTypes.CORE_INITIALIZE__CONFIG_FETCH:
      return {
        ...state,
        config: payload.config,
      };
    case ActionTypes.USER_UPDATE_HANDLE:
      if (payload.config) {
        return {
          ...state,
          config: payload.config,
        };
      }

      return state;
    default:
      return state;
  }
};
