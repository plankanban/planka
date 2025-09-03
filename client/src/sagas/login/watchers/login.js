/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* loginWatchers() {
  yield all([
    takeEvery(EntryActionTypes.AUTHENTICATE, ({ payload: { data } }) =>
      services.authenticate(data),
    ),
    takeEvery(EntryActionTypes.WITH_OIDC_AUTHENTICATE, () => services.authenticateWithOidc()),
    takeEvery(EntryActionTypes.AUTHENTICATE_ERROR_CLEAR, () => services.clearAuthenticateError()),
    takeEvery(EntryActionTypes.TERMS_ACCEPT, ({ payload: { signature } }) =>
      services.acceptTerms(signature),
    ),
    takeEvery(EntryActionTypes.TERMS_CANCEL, () => services.cancelTerms()),
    takeEvery(EntryActionTypes.TERMS_LANGUAGE_UPDATE, ({ payload: { value } }) =>
      services.updateTermsLanguage(value),
    ),
  ]);
}
