/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, cancel, fork, take } from 'redux-saga/effects';

import watchers from './watchers';
import services from './services';
import runWatchers from '../run-watchers';
import ActionTypes from '../../constants/ActionTypes';

export default function* loginSaga() {
  const watcherTasks = yield runWatchers(watchers);

  // Before anything can move the address bar: whatever URL this visit asked for
  // is the one a successful sign-in should return to. `handleLocationChange`
  // sends a board or card URL straight to /login, so this has to run ahead of it.
  yield call(services.rememberLoginRedirect);

  yield fork(services.initializeLogin);

  yield take([
    ActionTypes.AUTHENTICATE__SUCCESS,
    ActionTypes.TOTP_VERIFY__SUCCESS,
    ActionTypes.TERMS_ACCEPT__SUCCESS,
  ]);

  yield cancel(watcherTasks);

  // A remembered destination — the deep link that bounced to the login screen —
  // wins over the default landing page.
  const hasRedirected = yield call(services.goToLoginRedirect);

  if (hasRedirected) {
    return;
  }

  yield call(services.goToRoot);
}
