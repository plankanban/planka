import { nanoid } from 'nanoid';
import { call, put, select } from 'redux-saga/effects';
import { replace } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
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

export function* authenticateUsingOidc() {
  const oidcConfig = yield select(selectors.selectOidcConfig);

  const state = nanoid();
  window.localStorage.setItem('oidc-state', state);

  const nonce = nanoid();
  window.localStorage.setItem('oidc-nonce', nonce);

  let redirectUrl = `${oidcConfig.authorizationUrl}`;
  redirectUrl += `&state=${encodeURIComponent(state)}`;
  redirectUrl += `&nonce=${encodeURIComponent(nonce)}`;

  window.location.href = redirectUrl;
}

export function* authenticateUsingOidcCallback() {
  // https://github.com/plankanban/planka/issues/511#issuecomment-1771385639
  const params = new URLSearchParams(window.location.hash.substring(1) || window.location.search);

  const state = window.localStorage.getItem('oidc-state');
  window.localStorage.removeItem('oidc-state');

  const nonce = window.localStorage.getItem('oidc-nonce');
  window.localStorage.removeItem('oidc-nonce');

  yield put(replace(Paths.LOGIN));

  if (params.get('error') !== null) {
    yield put(
      actions.authenticateUsingOidc.failure(
        new Error(
          `OIDC Authorization error: ${params.get('error')}: ${params.get('error_description')}`,
        ),
      ),
    );
    return;
  }

  const code = params.get('code');
  if (code === null) {
    yield put(
      actions.authenticateUsingOidc.failure(new Error('Invalid OIDC response: no code parameter')),
    );
    return;
  }

  if (params.get('state') !== state) {
    yield put(
      actions.authenticateUsingOidc.failure(
        new Error('Unable to process OIDC response: state mismatch'),
      ),
    );
    return;
  }

  if (nonce === null) {
    yield put(
      actions.authenticateUsingOidc.failure(
        new Error('Unable to process OIDC response: no nonce issued'),
      ),
    );
    return;
  }

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.exchangeForAccessTokenUsingOidc, {
      code,
      nonce,
    }));
  } catch (error) {
    yield put(actions.authenticateUsingOidc.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.authenticateUsingOidc.success(accessToken));
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export default {
  initializeLogin,
  authenticate,
  authenticateUsingOidc,
  authenticateUsingOidcCallback,
  clearAuthenticateError,
};
