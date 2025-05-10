/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import omit from 'lodash/omit';
import { call, put, select } from 'redux-saga/effects';

import { goToProject, goToRoot } from './router';
import request from '../request';
import requests from '../requests';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import mergeRecords from '../../../utils/merge-records';
import { UserRoles } from '../../../constants/Enums';

export function* searchProjects(value) {
  yield put(actions.searchProjects(value));
}

export function* updateProjectsOrder(value) {
  yield put(actions.updateProjectsOrder(value));

  const currentUserId = yield select(selectors.selectCurrentUserId);

  try {
    yield call(request, api.updateUser, currentUserId, {
      defaultProjectsOrder: value,
    });
  } catch {
    /* empty */
  }
}

export function* toggleHiddenProjects(isVisible) {
  yield put(actions.toggleHiddenProjects(isVisible));
}

export function* createProject(data) {
  yield put(actions.createProject(omit(data, 'type')));

  let project;
  let projectManagers;

  try {
    ({
      item: project,
      included: { projectManagers },
    } = yield call(request, api.createProject, data));
  } catch (error) {
    yield put(actions.createProject.failure(error));
    return;
  }

  yield put(actions.createProject.success(project, projectManagers));
  yield call(goToProject, project.id);
}

export function* handleProjectCreate({ id }) {
  let project;
  let users;
  let projectManagers;
  let backgroundImages;
  let baseCustomFieldGroups;
  let boards;
  let boardMemberships;
  let customFields;
  let notificationServices;

  try {
    ({
      item: project,
      included: {
        users,
        projectManagers,
        backgroundImages,
        baseCustomFieldGroups,
        boards,
        boardMemberships,
        customFields,
        notificationServices,
      },
    } = yield call(request, api.getProject, id));
  } catch {
    return;
  }

  yield put(
    actions.handleProjectCreate(
      project,
      users,
      projectManagers,
      backgroundImages,
      baseCustomFieldGroups,
      boards,
      boardMemberships,
      customFields,
      notificationServices,
    ),
  );
}

export function* updateProject(id, data) {
  yield put(actions.updateProject(id, data));

  const isAvailableForCurrentUser = yield select(selectors.isCurrentModalAvailableForCurrentUser);

  if (!isAvailableForCurrentUser) {
    yield put(actions.closeModal());
  }

  let project;
  try {
    ({ item: project } = yield call(request, api.updateProject, id, data));
  } catch (error) {
    yield put(actions.updateProject.failure(id, error));
    return;
  }

  yield put(actions.updateProject.success(project));
}

export function* updateCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(updateProject, projectId, data);
}

export function* handleProjectUpdate(project) {
  const prevProject = yield select(selectors.selectProjectById, project.id);

  const isChangedToShared =
    (!prevProject || !!prevProject.ownerProjectManagerId) && !project.ownerProjectManagerId;

  const currentUser = yield select(selectors.selectCurrentUser);
  const isCurrentUserAdmin = currentUser.role === UserRoles.ADMIN;

  const isExternalAccessibleForCurrentUser = yield select(
    selectors.selectIsProjectWithIdExternalAccessibleForCurrentUser,
    project.id,
  );

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

  if (isCurrentUserAdmin && isChangedToShared && !isExternalAccessibleForCurrentUser) {
    const { boardId } = yield select(selectors.selectPath);

    try {
      ({
        item: project, // eslint-disable-line no-param-reassign
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
      } = yield call(request, api.getProject, project.id));
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

  const boardIds = yield select(selectors.selectBoardIdsByProjectId, project.id);

  const isAvailable = yield select(
    selectors.selectIsProjectWithIdAvailableForCurrentUser,
    project.id,
  );

  yield put(
    actions.handleProjectUpdate(
      project,
      boardIds,
      isAvailable,
      board,
      mergeRecords(users1, users2),
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

  const isAvailableForCurrentUser = yield select(selectors.isCurrentModalAvailableForCurrentUser);

  if (!isAvailableForCurrentUser) {
    yield put(actions.closeModal());
  }
}

export function* deleteProject(id) {
  const { projectId } = yield select(selectors.selectPath);

  yield put(actions.deleteProject(id));

  if (id === projectId) {
    yield call(goToRoot);
  }

  let project;
  try {
    ({ item: project } = yield call(request, api.deleteProject, id));
  } catch (error) {
    yield put(actions.deleteProject.failure(id, error));
    return;
  }

  yield put(actions.deleteProject.success(project));
}

export function* deleteCurrentProject() {
  const { projectId } = yield select(selectors.selectPath);

  yield call(deleteProject, projectId);
}

export function* handleProjectDelete(project) {
  const { projectId } = yield select(selectors.selectPath);

  yield put(actions.handleProjectDelete(project));

  if (project.id === projectId) {
    yield call(goToRoot);
  }
}

export default {
  searchProjects,
  updateProjectsOrder,
  toggleHiddenProjects,
  createProject,
  handleProjectCreate,
  updateProject,
  updateCurrentProject,
  handleProjectUpdate,
  deleteProject,
  deleteCurrentProject,
  handleProjectDelete,
};
