import { all, call, cancel, fork, take } from 'redux-saga/effects';

import watchers from './watchers';
import services from './services';
import ActionTypes from '../../constants/ActionTypes';

export default function* loginSaga() {
  const watcherTasks = yield all(watchers.map((watcher) => fork(watcher)));

  yield take(ActionTypes.AUTHENTICATE__SUCCESS);

  yield cancel(watcherTasks);
  yield call(services.goToRoot);
}
