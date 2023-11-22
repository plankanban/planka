import { call, put, take } from 'redux-saga/effects';

import request from '../request';
import requests from '../requests';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
import { removeAccessToken } from '../../../utils/access-token-storage';

export function* initializeCore() {
  const {
    user,
    board,
    users,
    projects,
    projectManagers,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
    activities,
    notifications,
  } = yield call(requests.fetchCore); // TODO: handle error

  yield call(i18n.changeLanguage, user.language);
  yield call(i18n.loadCoreLocale);

  yield put(
    actions.initializeCore(
      user,
      board,
      users,
      projects,
      projectManagers,
      boards,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      tasks,
      attachments,
      activities,
      notifications,
    ),
  );
}

export function* changeCoreLanguage(language) {
  if (language === null) {
    yield call(i18n.detectLanguage);
    yield call(i18n.loadCoreLocale);
    yield call(i18n.changeLanguage, i18n.resolvedLanguage);
  } else {
    yield call(i18n.loadCoreLocale, language);
    yield call(i18n.changeLanguage, language);
  }
}

export function* logout(invalidateAccessToken = true) {
  yield call(removeAccessToken);

  if (invalidateAccessToken) {
    yield put(actions.logout.invalidateAccessToken());

    try {
      yield call(request, api.deleteCurrentAccessToken);
    } catch (error) {} // eslint-disable-line no-empty
  }

  yield put(actions.logout());
  yield take();
}

export default {
  initializeCore,
  changeCoreLanguage,
  logout,
};
