import { LOCATION_CHANGE_HANDLE } from '../../lib/redux-router';

import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

const initialState = {
  data: {
    emailOrUsername: '',
    password: '',
  },
  isSubmitting: false,
  isSubmittingUsingOidc: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE_HANDLE:
      if (payload.location.pathname === Paths.OIDC_CALLBACK) {
        return {
          ...state,
          isSubmittingUsingOidc: true,
        };
      }

      return state;
    case ActionTypes.AUTHENTICATE:
      return {
        ...state,
        data: {
          ...state.data,
          ...payload.data,
        },
        isSubmitting: true,
      };
    case ActionTypes.AUTHENTICATE__SUCCESS:
    case ActionTypes.USING_OIDC_AUTHENTICATE__SUCCESS:
      return initialState;
    case ActionTypes.AUTHENTICATE__FAILURE:
      return {
        ...state,
        isSubmitting: false,
        error: payload.error,
      };
    case ActionTypes.USING_OIDC_AUTHENTICATE__FAILURE:
      return {
        ...state,
        isSubmittingUsingOidc: false,
        error: payload.error,
      };
    case ActionTypes.AUTHENTICATE_ERROR_CLEAR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
