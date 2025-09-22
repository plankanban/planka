/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { nanoid } from 'nanoid';
import { call, put, select } from 'redux-saga/effects';
import { replace } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
import { setAccessToken } from '../../../utils/access-token-storage';
import Paths from '../../../constants/Paths';
import AccessTokenSteps from '../../../constants/AccessTokenSteps';

export function* initializeLogin() {
  const { item: bootstrap } = yield call(api.getBootstrap); // TODO: handle error

  yield put(actions.initializeLogin(bootstrap));
}

export function* authenticate(data) {
  yield put(actions.authenticate(data));

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.createAccessToken, data));
  } catch (error) {
    let terms;
    if (error.step === AccessTokenSteps.ACCEPT_TERMS) {
      ({ item: terms } = yield call(api.getTerms, error.termsType, i18n.resolvedLanguage));
    }

    yield put(actions.authenticate.failure(error, terms));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.authenticate.success(accessToken));
}

export function* authenticateWithOidc() {
  const oidcBootstrap = yield select(selectors.selectOidcBootstrap);

  const state = nanoid();
  window.localStorage.setItem('oidc-state', state);

  const nonce = nanoid();
  window.localStorage.setItem('oidc-nonce', nonce);

  let redirectUrl = `${oidcBootstrap.authorizationUrl}`;
  redirectUrl += `&state=${encodeURIComponent(state)}`;
  redirectUrl += `&nonce=${encodeURIComponent(nonce)}`;

  window.location.href = redirectUrl;
}

export function* authenticateWithOidcCallback() {
  // https://github.com/plankanban/planka/issues/511#issuecomment-1771385639
  const params = new URLSearchParams(window.location.hash.substring(1) || window.location.search);

  const state = window.localStorage.getItem('oidc-state');
  window.localStorage.removeItem('oidc-state');

  const nonce = window.localStorage.getItem('oidc-nonce');
  window.localStorage.removeItem('oidc-nonce');

  yield put(replace(Paths.LOGIN));

  if (params.get('error') !== null) {
    yield put(
      actions.authenticateWithOidc.failure(
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
      actions.authenticateWithOidc.failure(new Error('Invalid OIDC response: no code parameter')),
    );
    return;
  }

  if (params.get('state') !== state) {
    yield put(
      actions.authenticateWithOidc.failure(
        new Error('Unable to process OIDC response: state mismatch'),
      ),
    );
    return;
  }

  if (nonce === null) {
    yield put(
      actions.authenticateWithOidc.failure(
        new Error('Unable to process OIDC response: no nonce issued'),
      ),
    );
    return;
  }

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.exchangeForAccessTokenWithOidc, {
      code,
      nonce,
    }));
  } catch (error) {
    let terms;
    if (error.step === AccessTokenSteps.ACCEPT_TERMS) {
      ({ item: terms } = yield call(api.getTerms, error.termsType, i18n.resolvedLanguage));
    }

    yield put(actions.authenticateWithOidc.failure(error, terms));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.authenticateWithOidc.success(accessToken));
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export function* acceptTerms(signature) {
  yield put(actions.acceptTerms(signature));

  const { pendingToken } = yield select(selectors.selectAuthenticateForm);

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.acceptTerms, {
      pendingToken,
      signature,
    }));
  } catch (error) {
    yield put(actions.acceptTerms.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.acceptTerms.success(accessToken));
}

export function* cancelTerms() {
  const { pendingToken } = yield select(selectors.selectAuthenticateForm);

  yield put(actions.cancelTerms());

  try {
    yield call(api.revokePendingToken, {
      pendingToken,
    });
  } catch (error) {
    yield put(actions.cancelTerms.failure(error));
    return;
  }

  yield put(actions.cancelTerms.success(pendingToken));
}

export function* updateTermsLanguage(value) {
  yield put(actions.updateTermsLanguage(value));

  const {
    termsForm: {
      payload: { type },
    },
  } = yield select(selectors.selectAuthenticateForm);

  let terms;
  try {
    ({ item: terms } = yield call(api.getTerms, type, value));
  } catch (error) {
    yield put(actions.updateTermsLanguage.failure(error));
    return;
  }

  yield put(actions.updateTermsLanguage.success(terms));
}

export default {
  initializeLogin,
  authenticate,
  authenticateWithOidc,
  authenticateWithOidcCallback,
  clearAuthenticateError,
  acceptTerms,
  cancelTerms,
  updateTermsLanguage,
};
