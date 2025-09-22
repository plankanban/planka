/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initializeLogin = (bootstrap) => ({
  type: ActionTypes.LOGIN_INITIALIZE,
  payload: {
    bootstrap,
  },
});

const authenticate = (data) => ({
  type: ActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

authenticate.success = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticate.failure = (error, terms) => ({
  type: ActionTypes.AUTHENTICATE__FAILURE,
  payload: {
    error,
    terms,
  },
});

const authenticateWithOidc = () => ({
  type: ActionTypes.WITH_OIDC_AUTHENTICATE,
  payload: {},
});

authenticateWithOidc.success = (accessToken) => ({
  type: ActionTypes.WITH_OIDC_AUTHENTICATE__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticateWithOidc.failure = (error, terms) => ({
  type: ActionTypes.WITH_OIDC_AUTHENTICATE__FAILURE,
  payload: {
    error,
    terms,
  },
});

const clearAuthenticateError = () => ({
  type: ActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

const acceptTerms = (signature) => ({
  type: ActionTypes.TERMS_ACCEPT,
  payload: {
    signature,
  },
});

acceptTerms.success = (accessToken) => ({
  type: ActionTypes.TERMS_ACCEPT__SUCCESS,
  payload: {
    accessToken,
  },
});

acceptTerms.failure = (error) => ({
  type: ActionTypes.TERMS_ACCEPT__FAILURE,
  payload: {
    error,
  },
});

const cancelTerms = () => ({
  type: ActionTypes.TERMS_CANCEL,
  payload: {},
});

cancelTerms.success = () => ({
  type: ActionTypes.TERMS_CANCEL__SUCCESS,
  payload: {},
});

cancelTerms.failure = (error) => ({
  type: ActionTypes.TERMS_CANCEL__FAILURE,
  payload: {
    error,
  },
});

const updateTermsLanguage = (value) => ({
  type: ActionTypes.TERMS_LANGUAGE_UPDATE,
  payload: {
    value,
  },
});

updateTermsLanguage.success = (terms) => ({
  type: ActionTypes.TERMS_LANGUAGE_UPDATE__SUCCESS,
  payload: {
    terms,
  },
});

updateTermsLanguage.failure = (error) => ({
  type: ActionTypes.TERMS_LANGUAGE_UPDATE__FAILURE,
  payload: {
    error,
  },
});

export default {
  initializeLogin,
  authenticate,
  authenticateWithOidc,
  clearAuthenticateError,
  acceptTerms,
  cancelTerms,
  updateTermsLanguage,
};
