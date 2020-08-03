import { all, takeLatest } from 'redux-saga/effects';

import { authenticateService, clearAuthenticateErrorService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* loginWatchers() {
  yield all([
    takeLatest(EntryActionTypes.AUTHENTICATE, ({ payload: { data } }) => authenticateService(data)),
    takeLatest(EntryActionTypes.AUTHENTICATE_ERROR_CLEAR, () => clearAuthenticateErrorService()),
  ]);
}
