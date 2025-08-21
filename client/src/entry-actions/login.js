/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const authenticate = (data) => ({
  type: EntryActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

const authenticateWithOidc = () => ({
  type: EntryActionTypes.WITH_OIDC_AUTHENTICATE,
  payload: {},
});

const clearAuthenticateError = () => ({
  type: EntryActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

const acceptTerms = (signature) => ({
  type: EntryActionTypes.TERMS_ACCEPT,
  payload: {
    signature,
  },
});

const cancelTerms = () => ({
  type: EntryActionTypes.TERMS_CANCEL,
  payload: {},
});

const updateTermsLanguage = (value) => ({
  type: EntryActionTypes.TERMS_LANGUAGE_UPDATE,
  payload: {
    value,
  },
});

export default {
  authenticate,
  authenticateWithOidc,
  clearAuthenticateError,
  acceptTerms,
  cancelTerms,
  updateTermsLanguage,
};
