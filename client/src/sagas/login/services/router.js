import { call, put, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import { pathsMatchSelector } from '../../../selectors';
import Paths from '../../../constants/Paths';

export function* goToLoginService() {
  yield put(push(Paths.LOGIN));
}

export function* goToRootService() {
  yield put(push(Paths.ROOT));
}

export function* locationChangedService() {
  const pathsMatch = yield select(pathsMatchSelector);

  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.path) {
    case Paths.ROOT:
    case Paths.PROJECTS:
    case Paths.BOARDS:
    case Paths.CARDS:
      yield call(goToLoginService);

      break;
    default:
  }
}
