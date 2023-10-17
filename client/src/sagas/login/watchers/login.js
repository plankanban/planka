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
  ]);
}
