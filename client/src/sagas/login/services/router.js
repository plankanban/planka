/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select, take } from 'redux-saga/effects';
import { push } from '../../../lib/redux-router';

import { authenticateWithOidc, authenticateWithOidcCallback } from './login';
import selectors from '../../../selectors';
import ActionTypes from '../../../constants/ActionTypes';
import Paths from '../../../constants/Paths';

export function* goTo(pathname) {
  yield put(push(pathname));
}

export function* goToLogin() {
  yield call(goTo, Paths.LOGIN);
}

export function* goToRoot() {
  yield call(goTo, Paths.ROOT);
}

export function* handleLocationChange() {
  const pathsMatch = yield select(selectors.selectPathsMatch);

  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.pattern.path) {
    case Paths.ROOT:
    case Paths.PROJECTS:
    case Paths.BOARDS:
    case Paths.CARDS:
      yield call(goToLogin);

      break;
    default:
  }

  const isInitializing = yield select(selectors.selectIsInitializing);

  if (isInitializing) {
    yield take(ActionTypes.LOGIN_INITIALIZE);
  }

  switch (pathsMatch.pattern.path) {
    case Paths.LOGIN: {
      const oidcBootstrap = yield select(selectors.selectOidcBootstrap);

      if (oidcBootstrap) {
        const params = new URLSearchParams(window.location.search);

        if (params.has('authenticateWithOidc')) {
          yield call(authenticateWithOidc);
        }
      }

      break;
    }
    case Paths.OIDC_CALLBACK:
      yield call(authenticateWithOidcCallback);

      break;
    default:
  }
}

export default {
  goTo,
  goToLogin,
  goToRoot,
  handleLocationChange,
};
