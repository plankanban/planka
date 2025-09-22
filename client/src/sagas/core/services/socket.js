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

export function* handleSocketDisconnect() {
  yield put(actions.handleSocketDisconnect());
}

export function* handleSocketReconnect() {
  const { boardId } = yield select(selectors.selectPath);
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield put(actions.handleSocketReconnect.fetchCore(currentUserId, boardId));

  let bootstrap;
  let config;
  let user;
  let board;
  let webhooks;
  let users;
  let projects;
  let projectManagers;
  let backgroundImages;
  let baseCustomFieldGroups;
  let boards;
  let boardMemberships;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields;
  let customFieldValues;
  let notifications;
  let notificationServices;

  try {
    ({ item: bootstrap } = yield call(request, api.getBootstrap));

    ({
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
    } = yield call(requests.fetchCore));
  } catch {
    return;
  }

  yield put(
    actions.handleSocketReconnect(
      bootstrap,
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

  const isAvailableForCurrentUser = yield select(selectors.isCurrentModalAvailableForCurrentUser);

  if (!isAvailableForCurrentUser) {
    yield put(actions.closeModal());
  }
}

export default {
  handleSocketDisconnect,
  handleSocketReconnect,
};
