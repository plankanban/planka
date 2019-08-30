import { call, put, select } from 'redux-saga/effects';

import { runPathActionsService } from './router';
import {
  fetchCardRequest,
  fetchCurrentUserRequest,
  fetchNotificationsRequest,
  fetchProjectsRequest,
  fetchUsersRequest,
} from '../requests';
import { pathsMatchSelector } from '../../../selectors';
import { appInitialized } from '../../../actions';
import i18n from '../../../i18n';
import Paths from '../../../constants/Paths';

export function* loadLocaleService(language) {
  try {
    yield call(i18n.loadAppLocale, language);

    return true;
  } catch (error) {
    return false;
  }
}

export function* initializeAppService() {
  const {
    payload: {
      user: { isAdmin },
    },
  } = yield call(fetchCurrentUserRequest); // TODO: success check

  if (isAdmin) {
    yield call(fetchUsersRequest);
  }

  yield call(fetchProjectsRequest);

  const pathsMatch = yield select(pathsMatchSelector);

  if (pathsMatch && pathsMatch.path === Paths.CARDS) {
    yield call(fetchCardRequest, pathsMatch.params.id);
  }

  yield call(fetchNotificationsRequest);
  yield call(runPathActionsService, pathsMatch);
  yield call(loadLocaleService, i18n.language);

  yield put(appInitialized());
}
