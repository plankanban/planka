import { all, takeEvery } from 'redux-saga/effects';

import { authenticateService, clearAuthenticateErrorService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* loginWatchers() {
  yield all([
    takeEvery(EntryActionTypes.AUTHENTICATE, ({ payload: { data } }) => authenticateService(data)),
    takeEvery(EntryActionTypes.AUTHENTICATE_ERROR_CLEAR, () => clearAuthenticateErrorService()),
  ]);
}
