import { all, apply, call, fork, take } from 'redux-saga/effects';

import watchers from './watchers';
import { initializeAppService } from './services';
import { socket } from '../../api';
import { removeAccessToken } from '../../utils/access-token-storage';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

export default function*() {
  yield all(watchers.map(watcher => fork(watcher)));

  yield apply(socket, socket.connect);
  yield fork(initializeAppService);

  yield take(ActionTypes.LOGOUT);

  yield call(removeAccessToken);
  window.location.href = Paths.LOGIN;
}
