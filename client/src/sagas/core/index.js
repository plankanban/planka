/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { apply, fork, take } from 'redux-saga/effects';

import watchers from './watchers';
import services from './services';
import runWatchers from '../run-watchers';
import { socket } from '../../api';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

export default function* coreSaga() {
  yield runWatchers(watchers);

  yield apply(socket, socket.connect);
  yield fork(services.initializeCore);

  yield take(ActionTypes.LOGOUT);

  window.location.href = Paths.LOGIN;
}
