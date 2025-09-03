/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { LOCATION_CHANGE_HANDLE } from '../../lib/redux-router';

import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

const initialState = {
  data: {
    emailOrUsername: '',
    password: '',
  },
  isSubmitting: false,
  isSubmittingWithOidc: false,
  error: null,
  pendingToken: null,
  step: null,
  termsForm: {
    payload: null,
    isSubmitting: false,
    isCancelling: false,
    isLanguageUpdating: false,
  },
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE_HANDLE:
      if (payload.location.pathname === Paths.OIDC_CALLBACK) {
        return {
          ...state,
          isSubmittingWithOidc: true,
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
    case ActionTypes.WITH_OIDC_AUTHENTICATE__SUCCESS:
    case ActionTypes.TERMS_ACCEPT__SUCCESS:
    case ActionTypes.TERMS_CANCEL__SUCCESS:
    case ActionTypes.TERMS_CANCEL__FAILURE:
      return initialState;
    case ActionTypes.AUTHENTICATE__FAILURE:
      if (payload.terms) {
        return {
          ...state,
          data: initialState.data,
          pendingToken: payload.error.pendingToken,
          step: payload.error.step,
          termsForm: {
            ...state.termsForm,
            payload: payload.terms,
          },
        };
      }

      return {
        ...state,
        isSubmitting: false,
        error: payload.error,
      };
    case ActionTypes.WITH_OIDC_AUTHENTICATE__FAILURE:
      if (payload.terms) {
        return {
          ...state,
          data: initialState.data,
          pendingToken: payload.error.pendingToken,
          step: payload.error.step,
          termsForm: {
            ...state.termsForm,
            payload: payload.terms,
          },
        };
      }

      return {
        ...state,
        isSubmittingWithOidc: false,
        error: payload.error,
      };
    case ActionTypes.AUTHENTICATE_ERROR_CLEAR:
      return {
        ...state,
        error: null,
      };
    case ActionTypes.TERMS_ACCEPT:
      return {
        ...state,
        termsForm: {
          ...state.termsForm,
          isSubmitting: true,
        },
      };
    case ActionTypes.TERMS_ACCEPT__FAILURE:
      return {
        ...initialState,
        error: payload.error,
      };
    case ActionTypes.TERMS_CANCEL:
      return {
        ...state,
        pendingToken: null,
        termsForm: {
          ...state.termsForm,
          isCancelling: true,
        },
      };
    case ActionTypes.TERMS_LANGUAGE_UPDATE:
      return {
        ...state,
        termsForm: {
          ...state.termsForm,
          isLanguageUpdating: true,
        },
      };
    case ActionTypes.TERMS_LANGUAGE_UPDATE__SUCCESS:
      return {
        ...state,
        termsForm: {
          ...state.termsForm,
          payload: payload.terms,
          isLanguageUpdating: false,
        },
      };
    case ActionTypes.TERMS_LANGUAGE_UPDATE__FAILURE:
      return {
        ...state,
        termsForm: {
          ...state.termsForm,
          isLanguageUpdating: false,
        },
      };
    default:
      return state;
  }
};
