import { all, takeLatest } from 'redux-saga/effects';

import { authenticateService, clearAuthenticationErrorService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* () {
  yield all([
    takeLatest(EntryActionTypes.AUTHENTICATE, ({ payload: { data } }) => authenticateService(data)),
    // eslint-disable-next-line max-len
    takeLatest(EntryActionTypes.AUTHENTICATION_ERROR_CLEAR, () => clearAuthenticationErrorService()),
  ]);
}
