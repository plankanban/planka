/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  items: [],
  isFetching: false,
  isFetched: false,
  deletingIds: [],
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.LOGOUT__ACCESS_TOKEN_REVOKE:
      return initialState;
    case ActionTypes.USER_TRUSTED_DEVICES_FETCH:
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    case ActionTypes.USER_TRUSTED_DEVICES_FETCH__SUCCESS:
      return {
        ...state,
        isFetching: false,
        isFetched: true,
        items: payload.devices,
      };
    case ActionTypes.USER_TRUSTED_DEVICES_FETCH__FAILURE:
      return {
        ...state,
        isFetching: false,
        error: payload.error,
      };
    case ActionTypes.USER_TRUSTED_DEVICE_DELETE:
      return {
        ...state,
        deletingIds: [...state.deletingIds, payload.deviceId],
      };
    case ActionTypes.USER_TRUSTED_DEVICE_DELETE__SUCCESS:
      return {
        ...state,
        items: state.items.filter((d) => d.id !== payload.device.id),
        deletingIds: state.deletingIds.filter((id) => id !== payload.device.id),
      };
    case ActionTypes.USER_TRUSTED_DEVICE_DELETE__FAILURE:
      return {
        ...state,
        deletingIds: state.deletingIds.filter((id) => id !== payload.deviceId),
      };
    default:
      return state;
  }
};
