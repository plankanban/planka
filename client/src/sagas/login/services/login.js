import { apply, call, put, select } from 'redux-saga/effects';
import { replace } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createOidcManager } from '../../../utils/oidc-manager';
import { setAccessToken } from '../../../utils/access-token-storage';
import Paths from '../../../constants/Paths';

export function* initializeLogin() {
  const { item: config } = yield call(api.getConfig); // TODO: handle error

  yield put(actions.initializeLogin(config));
}

export function* authenticate(data) {
  yield put(actions.authenticate(data));

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.createAccessToken, data));
  } catch (error) {
    yield put(actions.authenticate.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.authenticate.success(accessToken));
}

export function* authenticateWithOidc() {
  const oidcConfig = yield select(selectors.selectOidcConfig);
  const oidcManager = createOidcManager(oidcConfig);

  yield apply(oidcManager, oidcManager.login);
}

export function* authenticateWithOidcCallback() {
  const oidcConfig = yield select(selectors.selectOidcConfig);
  const oidcManager = createOidcManager(oidcConfig);

  let oidcToken;
  try {
    ({ access_token: oidcToken } = yield apply(oidcManager, oidcManager.loginCallback));
  } catch (error) {
    yield put(actions.authenticateWithOidc.failure(error));
  }

  yield put(replace(Paths.LOGIN));

  if (oidcToken) {
    let accessToken;
    try {
      ({ item: accessToken } = yield call(api.exchangeToAccessToken, {
        token: oidcToken,
      }));
    } catch (error) {
      yield put(actions.authenticateWithOidc.failure(error));
      return;
    }

    yield call(setAccessToken, accessToken);
    yield put(actions.authenticateWithOidc.success(accessToken));
  }
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export default {
  initializeLogin,
  authenticate,
  authenticateWithOidc,
  authenticateWithOidcCallback,
  clearAuthenticateError,
};
