/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import requests from '../requests';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../i18n';
import { removeAccessToken } from '../../../utils/access-token-storage';

export function* initializeCore() {
  const { item: bootstrap } = yield call(request, api.getBootstrap); // TODO: handle error

  yield put(actions.initializeCore.fetchBootstrap(bootstrap));

  const {
    config,
    user,
    board,
    webhooks,
    users,
    projects,
    projectManagers,
    backgroundImages,
    baseCustomFieldGroups,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
    notifications,
    notificationServices,
  } = yield call(requests.fetchCore); // TODO: handle error

  yield call(i18n.changeLanguage, user.language);
  yield call(i18n.loadCoreLocale);

  yield put(
    actions.initializeCore(
      config,
      user,
      board,
      webhooks,
      users,
      projects,
      projectManagers,
      backgroundImages,
      baseCustomFieldGroups,
      boards,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
      notifications,
      notificationServices,
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

export function* toggleFavorites(isEnabled) {
  yield put(actions.toggleFavorites(isEnabled));

  const currentUserId = yield select(selectors.selectCurrentUserId);

  try {
    yield call(request, api.updateUser, currentUserId, {
      enableFavoritesByDefault: isEnabled,
    });
  } catch {
    /* empty */
  }
}

export function* toggleEditMode(isEnabled) {
  yield put(actions.toggleEditMode(isEnabled));
}

export function* updateHomeView(value) {
  yield put(actions.updateHomeView(value));

  const currentUserId = yield select(selectors.selectCurrentUserId);

  try {
    yield call(request, api.updateUser, currentUserId, {
      defaultHomeView: value,
    });
  } catch {
    /* empty */
  }
}

export function* logout(revokeAccessToken) {
  yield call(removeAccessToken);

  if (revokeAccessToken) {
    yield put(actions.logout.revokeAccessToken());

    try {
      yield call(request, api.deleteCurrentAccessToken);
    } catch {
      /* empty */
    }
  }

  yield put(actions.logout()); // TODO: next url
}

export default {
  initializeCore,
  changeCoreLanguage,
  toggleFavorites,
  toggleEditMode,
  updateHomeView,
  logout,
};
