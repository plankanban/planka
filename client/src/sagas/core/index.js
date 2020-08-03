import { all, apply, call, fork, take } from 'redux-saga/effects';

import watchers from './watchers';
import { initializeCoreService } from './services';
import { socket } from '../../api';
import { removeAccessToken } from '../../utils/access-token-storage';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

export default function* coreSaga() {
  yield all(watchers.map((watcher) => fork(watcher)));

  yield apply(socket, socket.connect);
  yield fork(initializeCoreService);

  yield take(ActionTypes.LOGOUT);

  yield call(removeAccessToken);
  window.location.href = Paths.LOGIN;
}
