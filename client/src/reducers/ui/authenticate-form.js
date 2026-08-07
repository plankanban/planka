/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../../constants/ActionTypes';
import AccessTokenSteps from '../../constants/AccessTokenSteps';

const initialState = {
  data: {
    emailOrUsername: '',
    password: '',
  },
  isSubmitting: false,
  error: null,
  pendingToken: null,
  step: null,
  termsForm: {
    payload: null,
    isSubmitting: false,
    isCancelling: false,
    isLanguageUpdating: false,
  },
  totpForm: {
    isSubmitting: false,
    isCancelling: false,
    error: null,
  },
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
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
    case ActionTypes.TERMS_ACCEPT__SUCCESS:
    case ActionTypes.TERMS_CANCEL__SUCCESS:
    case ActionTypes.TERMS_CANCEL__FAILURE:
    case ActionTypes.TOTP_VERIFY__SUCCESS:
    case ActionTypes.TOTP_CHALLENGE_CANCEL__SUCCESS:
    case ActionTypes.TOTP_CHALLENGE_CANCEL__FAILURE:
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

      if (payload.error && payload.error.step === AccessTokenSteps.VERIFY_TOTP) {
        return {
          ...state,
          data: initialState.data,
          isSubmitting: false,
          pendingToken: payload.error.pendingToken,
          step: payload.error.step,
          totpForm: initialState.totpForm,
        };
      }

      return {
        ...state,
        isSubmitting: false,
        error: payload.error,
      };
    case ActionTypes.TOTP_VERIFY:
      return {
        ...state,
        totpForm: {
          ...state.totpForm,
          isSubmitting: true,
          error: null,
        },
      };
    case ActionTypes.TOTP_VERIFY__FAILURE:
      return {
        ...state,
        totpForm: {
          ...state.totpForm,
          isSubmitting: false,
          error: payload.error,
        },
      };
    case ActionTypes.TOTP_CHALLENGE_CANCEL:
      return {
        ...state,
        pendingToken: null,
        totpForm: {
          ...state.totpForm,
          isCancelling: true,
        },
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
