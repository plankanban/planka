/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import { goToProject } from './router';
import request from '../request';
import requests from '../requests';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import mergeRecords from '../../../utils/merge-records';

export function* createBoardMembership(boardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createBoardMembership({
      ...data,
      boardId,
      id: localId,
    }),
  );

  let boardMembership;
  try {
    ({ item: boardMembership } = yield call(request, api.createBoardMembership, boardId, data));
  } catch (error) {
    yield put(actions.createBoardMembership.failure(localId, error));
    return;
  }

  yield put(actions.createBoardMembership.success(localId, boardMembership));
}

export function* createMembershipInCurrentBoard(data) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(createBoardMembership, boardId, data);
}

export function* handleBoardMembershipCreate(boardMembership, users) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const isCurrentUser = boardMembership.userId === currentUserId;

  const isExternalAccessibleForCurrentUser = yield select(
    selectors.selectIsProjectWithIdExternalAccessibleForCurrentUser,
    boardMembership.projectId,
  );

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

  if (isCurrentUser && !isExternalAccessibleForCurrentUser) {
    const { boardId } = yield select(selectors.selectPath);

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
      } = yield call(request, api.getProject, boardMembership.projectId));
    } catch {
      return;
    }

    if (boardId === null) {
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

  const isProjectAvailable = yield select(
    selectors.selectIsProjectWithIdAvailableForCurrentUser,
    boardMembership.projectId,
  );

  yield put(
    actions.handleBoardMembershipCreate(
      boardMembership,
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

export function* updateBoardMembership(id, data) {
  yield put(actions.updateBoardMembership(id, data));

  let boardMembership;
  try {
    ({ item: boardMembership } = yield call(request, api.updateBoardMembership, id, data));
  } catch (error) {
    yield put(actions.updateBoardMembership.failure(id, error));
    return;
  }

  yield put(actions.updateBoardMembership.success(boardMembership));
}

export function* handleBoardMembershipUpdate(boardMembership) {
  yield put(actions.handleBoardMembershipUpdate(boardMembership));
}

export function* deleteBoardMembership(id) {
  let boardMembership = yield select(selectors.selectBoardMembershipById, id);

  const { boardId, projectId } = yield select(selectors.selectPath);

  const currentUserId = yield select(selectors.selectCurrentUserId);
  const isCurrentUser = boardMembership.userId === currentUserId;

  yield put(actions.deleteBoardMembership(id, isCurrentUser));

  if (isCurrentUser && boardMembership.boardId === boardId) {
    const isAvailableForCurrentUser = yield select(
      selectors.selectIsBoardWithIdAvailableForCurrentUser,
      boardMembership.boardId,
    );

    if (!isAvailableForCurrentUser) {
      yield call(goToProject, projectId);
    }
  }

  try {
    ({ item: boardMembership } = yield call(request, api.deleteBoardMembership, id));
  } catch (error) {
    yield put(actions.deleteBoardMembership.failure(id, error));
    return;
  }

  yield put(actions.deleteBoardMembership.success(boardMembership, isCurrentUser));
}

export function* handleBoardMembershipDelete(boardMembership) {
  const { boardId, projectId } = yield select(selectors.selectPath);

  const currentUserId = yield select(selectors.selectCurrentUserId);
  const isCurrentUser = boardMembership.userId === currentUserId;

  yield put(actions.handleBoardMembershipDelete(boardMembership, isCurrentUser));

  if (isCurrentUser && boardMembership.boardId === boardId) {
    const isAvailableForCurrentUser = yield select(
      selectors.selectIsBoardWithIdAvailableForCurrentUser,
      boardMembership.boardId,
    );

    if (!isAvailableForCurrentUser) {
      yield call(goToProject, projectId);
    }
  }
}

export default {
  createBoardMembership,
  createMembershipInCurrentBoard,
  handleBoardMembershipCreate,
  updateBoardMembership,
  handleBoardMembershipUpdate,
  deleteBoardMembership,
  handleBoardMembershipDelete,
};
