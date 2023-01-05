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

export function* handleBoardMembershipCreate(boardMembership) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const isCurrentUser = boardMembership.userId === currentUserId;

  let user;
  let project;
  let board1;
  let users1;
  let users2;
  let projectManagers;
  let boards;
  let boardMemberships1;
  let boardMemberships2;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let tasks;
  let attachments;
  let deletedNotifications;

  if (isCurrentUser) {
    let board2;
    try {
      ({ item: board2 } = yield call(request, api.getBoard, boardMembership.boardId, false));
    } catch {
      return;
    }

    const { boardId } = yield select(selectors.selectPath);

    yield put(
      actions.handleBoardMembershipCreate.fetchProject(board2.projectId, currentUserId, boardId),
    );

    try {
      ({
        item: project,
        included: { users: users1, projectManagers, boards, boardMemberships: boardMemberships1 },
      } = yield call(request, api.getProject, board2.projectId));
    } catch {
      return;
    }

    let body;
    try {
      body = yield call(requests.fetchBoardByCurrentPath);
    } catch {} // eslint-disable-line no-empty

    if (body && body.project && body.project.id === board2.projectId) {
      ({
        project,
        board: board1,
        users: users2,
        boardMemberships: boardMemberships2,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        tasks,
        attachments,
      } = body);

      if (body.card) {
        deletedNotifications = yield select(selectors.selectNotificationsByCardId, body.card.id);
      }
    }
  } else {
    try {
      ({ item: user } = yield call(request, api.getUser, boardMembership.userId));
    } catch {
      return;
    }
  }

  yield put(
    actions.handleBoardMembershipCreate(
      boardMembership,
      project,
      board1,
      isCurrentUser ? mergeRecords(users1, users2) : [user],
      projectManagers,
      boards,
      mergeRecords(boardMemberships1, boardMemberships2),
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      tasks,
      attachments,
      deletedNotifications,
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

  const currentUserId = yield select(selectors.selectCurrentUserId);
  const { boardId, projectId } = yield select(selectors.selectPath);

  if (boardMembership.userId === currentUserId && boardMembership.boardId === boardId) {
    const isCurrentUserManager = yield select(
      selectors.selectIsCurrentUserManagerForCurrentProject,
    );

    if (!isCurrentUserManager) {
      yield call(goToProject, projectId);
    }
  }

  yield put(actions.deleteBoardMembership(id));

  try {
    ({ item: boardMembership } = yield call(request, api.deleteBoardMembership, id));
  } catch (error) {
    yield put(actions.deleteBoardMembership.failure(id, error));
    return;
  }

  yield put(actions.deleteBoardMembership.success(boardMembership));
}

export function* handleBoardMembershipDelete(boardMembership) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const { boardId, projectId } = yield select(selectors.selectPath);

  if (boardMembership.userId === currentUserId && boardMembership.boardId === boardId) {
    const isCurrentUserManager = yield select(
      selectors.selectIsCurrentUserManagerForCurrentProject,
    );

    if (!isCurrentUserManager) {
      yield call(goToProject, projectId);
    }
  }

  yield put(actions.handleBoardMembershipDelete(boardMembership));
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
