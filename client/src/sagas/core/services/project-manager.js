import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { fetchBoardByCurrentPathRequest } from '../requests';
import {
  currentUserIdSelector,
  notificationsByCardIdSelector,
  pathSelector,
  projectManagerByIdSelector,
} from '../../../selectors';
import {
  createProjectManager,
  deleteProjectManager,
  handleProjectManagerCreate,
  handleProjectManagerDelete,
} from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import mergeRecords from '../../../utils/merge-records';

export function* createProjectManagerService(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    createProjectManager({
      ...data,
      projectId,
      id: localId,
    }),
  );

  let projectManager;
  try {
    ({ item: projectManager } = yield call(request, api.createProjectManager, projectId, data));
  } catch (error) {
    yield put(createProjectManager.failure(localId, error));
  }

  yield put(createProjectManager.success(localId, projectManager));
}

export function* createManagerInCurrentProjectService(data) {
  const { projectId } = yield select(pathSelector);

  yield call(createProjectManagerService, projectId, data);
}

export function* handleProjectManagerCreateService(projectManager) {
  const currentUserId = yield select(currentUserIdSelector);
  const isCurrentUser = projectManager.userId === currentUserId;

  let user;
  let project;
  let board;
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
    const { boardId } = yield select(pathSelector);

    yield put(
      handleProjectManagerCreate.fetchProject(projectManager.projectId, currentUserId, boardId),
    );

    try {
      ({
        item: project,
        included: { users: users1, projectManagers, boards, boardMemberships: boardMemberships1 },
      } = yield call(request, api.getProject, projectManager.projectId));
    } catch {
      return;
    }

    let body;
    try {
      body = yield call(fetchBoardByCurrentPathRequest);
    } catch {} // eslint-disable-line no-empty

    if (body && body.project && body.project.id === projectManager.projectId) {
      ({
        project,
        board,
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
      ({ item: user } = yield call(request, api.getUser, projectManager.userId));
    } catch {
      return;
    }
  }

  yield put(
    handleProjectManagerCreate(
      projectManager,
      project,
      board,
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

export function* deleteProjectManagerService(id) {
  let projectManager = yield select(projectManagerByIdSelector, id);

  const currentUserId = yield select(currentUserIdSelector);
  const { projectId } = yield select(pathSelector);

  yield put(
    deleteProjectManager(
      id,
      projectManager.userId === currentUserId,
      projectManager.projectId === projectId,
    ),
  );

  try {
    ({ item: projectManager } = yield call(request, api.deleteProjectManager, id));
  } catch (error) {
    yield put(deleteProjectManager.failure(id, error));
    return;
  }

  yield put(deleteProjectManager.success(projectManager));
}

export function* handleProjectManagerDeleteService(projectManager) {
  const currentUserId = yield select(currentUserIdSelector);
  const { projectId } = yield select(pathSelector);

  yield put(
    handleProjectManagerDelete(
      projectManager,
      projectManager.userId === currentUserId,
      projectManager.projectId === projectId,
    ),
  );
}
