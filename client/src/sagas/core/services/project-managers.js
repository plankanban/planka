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

export function* handleProjectManagerCreate(projectManager) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
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
  let deletedNotifications;

  if (isCurrentUser) {
    const { boardId } = yield select(selectors.selectPath);

    yield put(
      actions.handleProjectManagerCreate.fetchProject(
        projectManager.projectId,
        currentUserId,
        boardId,
      ),
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
      body = yield call(requests.fetchBoardByCurrentPath);
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
        deletedNotifications = yield select(selectors.selectNotificationsByCardId, body.card.id);
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
    actions.handleProjectManagerCreate(
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
      deletedNotifications,
    ),
  );
}

export function* deleteProjectManager(id) {
  let projectManager = yield select(selectors.selectProjectManagerById, id);

  const currentUserId = yield select(selectors.selectCurrentUserId);
  const { projectId } = yield select(selectors.selectPath);

  yield put(
    actions.deleteProjectManager(
      id,
      projectManager.userId === currentUserId,
      projectManager.projectId === projectId,
    ),
  );

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
  const { projectId } = yield select(selectors.selectPath);

  yield put(
    actions.handleProjectManagerDelete(
      projectManager,
      projectManager.userId === currentUserId,
      projectManager.projectId === projectId,
    ),
  );
}

export default {
  createProjectManager,
  createManagerInCurrentProject,
  handleProjectManagerCreate,
  deleteProjectManager,
  handleProjectManagerDelete,
};
