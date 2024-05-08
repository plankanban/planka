import { all, apply, fork, select, take } from 'redux-saga/effects';

import watchers from './watchers';
import services from './services';
import selectors from '../../selectors';
import { socket } from '../../api';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

export default function* coreSaga() {
  yield all(watchers.map((watcher) => fork(watcher)));

  yield apply(socket, socket.connect);
  yield fork(services.initializeCore);

  yield take(ActionTypes.LOGOUT);

  const oidcConfig = yield select(selectors.selectOidcConfig);

  if (oidcConfig && oidcConfig.endSessionUrl !== null) {
    // Redirect the user to the IDP to log out.
    window.location.href = oidcConfig.endSessionUrl;
  } else {
    window.location.href = Paths.LOGIN;
  }
}
