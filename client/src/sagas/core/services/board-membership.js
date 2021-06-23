import { call, put, select } from 'redux-saga/effects';

import { goToProjectService } from './router';
import request from '../request';
import { fetchBoardByCurrentPathRequest } from '../requests';
import {
  boardMembershipByIdSelector,
  currentUserIdSelector,
  isCurrentUserManagerForCurrentProjectSelector,
  notificationsByCardIdSelector,
  pathSelector,
} from '../../../selectors';
import {
  createBoardMembership,
  deleteBoardMembership,
  handleBoardMembershipCreate,
  handleBoardMembershipDelete,
} from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import mergeRecords from '../../../utils/merge-records';

export function* createBoardMembershipService(boardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    createBoardMembership({
      ...data,
      boardId,
      id: localId,
    }),
  );

  let boardMembership;
  try {
    ({ item: boardMembership } = yield call(request, api.createBoardMembership, boardId, data));
  } catch (error) {
    yield put(createBoardMembership.failure(localId, error));
    return;
  }

  yield put(createBoardMembership.success(localId, boardMembership));
}

export function* createMembershipInCurrentBoardService(data) {
  const { boardId } = yield select(pathSelector);

  yield call(createBoardMembershipService, boardId, data);
}

export function* handleBoardMembershipCreateService(boardMembership) {
  const currentUserId = yield select(currentUserIdSelector);
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
  let notifications;

  if (isCurrentUser) {
    let board2;
    try {
      ({ item: board2 } = yield call(request, api.getBoard, boardMembership.boardId));
    } catch {
      return;
    }

    const { boardId } = yield select(pathSelector);

    yield put(handleBoardMembershipCreate.fetchProject(board2.projectId, currentUserId, boardId));

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
      body = yield call(fetchBoardByCurrentPathRequest);
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
        notifications = yield select(notificationsByCardIdSelector, body.card.id);
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
    handleBoardMembershipCreate(
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
      notifications,
    ),
  );
}

export function* deleteBoardMembershipService(id) {
  let boardMembership = yield select(boardMembershipByIdSelector, id);

  const currentUserId = yield select(currentUserIdSelector);
  const { boardId, projectId } = yield select(pathSelector);

  if (boardMembership.userId === currentUserId && boardMembership.boardId === boardId) {
    const isCurrentUserManager = yield select(isCurrentUserManagerForCurrentProjectSelector);

    if (!isCurrentUserManager) {
      yield call(goToProjectService, projectId);
    }
  }

  yield put(deleteBoardMembership(id));

  try {
    ({ item: boardMembership } = yield call(request, api.deleteBoardMembership, id));
  } catch (error) {
    yield put(deleteBoardMembership.failure(id, error));
    return;
  }

  yield put(deleteBoardMembership.success(boardMembership));
}

export function* handleBoardMembershipDeleteService(boardMembership) {
  const currentUserId = yield select(currentUserIdSelector);
  const { boardId, projectId } = yield select(pathSelector);

  if (boardMembership.userId === currentUserId && boardMembership.boardId === boardId) {
    const isCurrentUserManager = yield select(isCurrentUserManagerForCurrentProjectSelector);

    if (!isCurrentUserManager) {
      yield call(goToProjectService, projectId);
    }
  }

  yield put(handleBoardMembershipDelete(boardMembership));
}
