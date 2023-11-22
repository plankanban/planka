import { all, apply, fork, take } from 'redux-saga/effects';

import watchers from './watchers';
import services from './services';
import { socket } from '../../api';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

export default function* coreSaga() {
  yield all(watchers.map((watcher) => fork(watcher)));

  yield apply(socket, socket.connect);
  yield fork(services.initializeCore);

  yield take(ActionTypes.LOGOUT);

  window.location.href = Paths.LOGIN;
}
