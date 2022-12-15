import { call, put, select } from 'redux-saga/effects';
import { push } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';

export function* goToLogin() {
  yield put(push(Paths.LOGIN));
}

export function* goToRoot() {
  yield put(push(Paths.ROOT));
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
}

export default {
  goToLogin,
  goToRoot,
  handleLocationChange,
};
