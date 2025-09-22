/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  isLoading: false,
  logs: null,
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.SMTP_CONFIG_TEST:
      return {
        ...state,
        isLoading: true,
      };
    case ActionTypes.SMTP_CONFIG_TEST__SUCCESS:
      return {
        ...initialState,
        logs: payload.logs,
      };
    case ActionTypes.SMTP_CONFIG_TEST__FAILURE:
      return {
        ...initialState,
        error: payload.error,
      };
    default:
      return state;
  }
};
