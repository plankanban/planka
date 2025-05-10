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
import { createLocalId } from '../../../utils/local-id';
import mergeRecords from '../../../utils/merge-records';

export function* createProjectManager(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createProjectManager({
      ...data,
      projectId,
      id: localId,
    }),
  );

  let projectManager;
  try {
    ({ item: projectManager } = yield call(request, api.createProjectManager, projectId, data));
  } catch (error) {
    yield put(actions.createProjectManager.failure(localId, error));
    return;
  }

  yield put(actions.createProjectManager.success(localId, projectManager));
}

export function* createManagerInCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(createProjectManager, projectId, data);
}

export function* handleProjectManagerCreate(projectManager, users) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const isCurrentUser = projectManager.userId === currentUserId;

  let project;
  let board;
  let users1;
  let users2;
  let projectManagers;
  let backgroundImages;
  let baseCustomFieldGroups;
  let boards;
  let boardMemberships1;
  let boardMemberships2;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields1;
  let customFields2;
  let customFieldValues;
  let notificationsToDelete;
  let notificationServices;

  if (isCurrentUser) {
    const { boardId } = yield select(selectors.selectPath);

    const isExternalAccessibleForCurrentUser = yield select(
      selectors.selectIsProjectWithIdExternalAccessibleForCurrentUser,
      projectManager.projectId,
    );

    try {
      ({
        item: project,
        included: {
          projectManagers,
          backgroundImages,
          baseCustomFieldGroups,
          boards,
          notificationServices,
          users: users1,
          boardMemberships: boardMemberships1,
          customFields: customFields1,
        },
      } = yield call(request, api.getProject, projectManager.projectId));
    } catch {
      return;
    }

    if (boardId === null && !isExternalAccessibleForCurrentUser) {
      let body;
      try {
        body = yield call(requests.fetchBoardByCurrentPath);
      } catch {
        /* empty */
      }

      if (body) {
        ({
          project,
          board,
          labels,
          lists,
          cards,
          cardMemberships,
          cardLabels,
          taskLists,
          tasks,
          attachments,
          customFieldGroups,
          customFieldValues,
          users: users2,
          boardMemberships: boardMemberships2,
          customFields: customFields2,
        } = body);

        if (body.card) {
          notificationsToDelete = yield select(selectors.selectNotificationsByCardId, body.card.id);
        }
      }
    }
  }

  const boardIds = yield select(selectors.selectBoardIdsByProjectId, projectManager.projectId);

  const isProjectAvailable = yield select(
    selectors.selectIsProjectWithIdAvailableForCurrentUser,
    projectManager.projectId,
  );

  yield put(
    actions.handleProjectManagerCreate(
      projectManager,
      boardIds,
      isCurrentUser,
      isProjectAvailable,
      project,
      board,
      mergeRecords(users, users1, users2),
      projectManagers,
      backgroundImages,
      baseCustomFieldGroups,
      boards,
      mergeRecords(boardMemberships1, boardMemberships2),
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      mergeRecords(customFields1, customFields2),
      customFieldValues,
      notificationsToDelete,
      notificationServices,
    ),
  );
}

export function* deleteProjectManager(id) {
  let projectManager = yield select(selectors.selectProjectManagerById, id);
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield put(actions.deleteProjectManager(id));

  if (projectManager.userId === currentUserId) {
    const isAvailableForCurrentUser = yield select(selectors.isCurrentModalAvailableForCurrentUser);

    if (!isAvailableForCurrentUser) {
      yield put(actions.closeModal());
    }
  }

  try {
    ({ item: projectManager } = yield call(request, api.deleteProjectManager, id));
  } catch (error) {
    yield put(actions.deleteProjectManager.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectManager.success(projectManager));
}

export function* handleProjectManagerDelete(projectManager) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield put(actions.handleProjectManagerDelete(projectManager));

  if (projectManager.userId === currentUserId) {
    const isAvailableForCurrentUser = yield select(selectors.isCurrentModalAvailableForCurrentUser);

    if (!isAvailableForCurrentUser) {
      yield put(actions.closeModal());
    }
  }
}

export default {
  createProjectManager,
  createManagerInCurrentProject,
  handleProjectManagerCreate,
  deleteProjectManager,
  handleProjectManagerDelete,
};
