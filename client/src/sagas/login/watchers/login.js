import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* loginWatchers() {
  yield all([
    takeEvery(EntryActionTypes.AUTHENTICATE, ({ payload: { data } }) =>
      services.authenticate(data),
    ),
    takeEvery(EntryActionTypes.USING_OIDC_AUTHENTICATE, () => services.authenticateUsingOidc()),
    takeEvery(EntryActionTypes.AUTHENTICATE_ERROR_CLEAR, () => services.clearAuthenticateError()),
  ]);
}
