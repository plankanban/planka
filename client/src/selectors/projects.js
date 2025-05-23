/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';
import { isLocalId } from '../utils/local-id';

export const makeSelectProjectById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Project }, id) => {
      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      return projectModel.ref;
    },
  );

export const selectProjectById = makeSelectProjectById();

export const makeSelectBoardIdsByProjectId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Project, User }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      const currentUserModel = User.withId(currentUserId);

      return projectModel
        .getBoardsModelArrayAvailableForUser(currentUserModel)
        .map((boardModel) => boardModel.id);
    },
  );

export const selectBoardIdsByProjectId = makeSelectBoardIdsByProjectId();

export const makeSelectFirstBoardIdByProjectId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Project, User }, id, currentUserId) => {
      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      const currentUserModel = User.withId(currentUserId);
      const boardsModels = projectModel.getBoardsModelArrayAvailableForUser(currentUserModel);

      return boardsModels[0] && boardsModels[0].id;
    },
  );

export const selectFirstBoardIdByProjectId = makeSelectFirstBoardIdByProjectId();

export const makeSelectNotificationsTotalByProjectId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Project, User }, id, currentUserId) => {
      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      const currentUserModel = User.withId(currentUserId);
      const boardsModels = projectModel.getBoardsModelArrayAvailableForUser(currentUserModel);

      return boardsModels.reduce(
        (result, boardModel) => result + boardModel.getUnreadNotificationsQuerySet().count(),
        0,
      );
    },
  );

export const selectNotificationsTotalByProjectId = makeSelectNotificationsTotalByProjectId();

export const makeSelectIsProjectWithIdAvailableForCurrentUser = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Project, User }, id, currentUserId) => {
      const projectModel = Project.withId(id);

      if (!projectModel) {
        return false;
      }

      const currentUserModel = User.withId(currentUserId);
      return projectModel.isAvailableForUser(currentUserModel);
    },
  );

export const selectIsProjectWithIdAvailableForCurrentUser =
  makeSelectIsProjectWithIdAvailableForCurrentUser();

export const makeSelectIsProjectWithIdExternalAccessibleForCurrentUser = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Project, User }, id, currentUserId) => {
      const projectModel = Project.withId(id);

      if (!projectModel) {
        return false;
      }

      const currentUserModel = User.withId(currentUserId);
      return projectModel.isExternalAccessibleForUser(currentUserModel);
    },
  );

export const selectIsProjectWithIdExternalAccessibleForCurrentUser =
  makeSelectIsProjectWithIdExternalAccessibleForCurrentUser();

export const selectCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel.ref;
  },
);

export const selectManagersForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getManagersQuerySet()
      .toModelArray()
      .map((projectManagerModel) => ({
        ...projectManagerModel.ref,
        isPersisted: !isLocalId(projectManagerModel.id),
        user: projectManagerModel.user.ref,
      }));
  },
);

export const selectManagerUserIdsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getManagersQuerySet()
      .toRefArray()
      .map((projectManager) => projectManager.userId);
  },
);

export const selectBackgroundImageIdsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getBackgroundImagesQuerySet()
      .toRefArray()
      .map((backgroundImage) => backgroundImage.id);
  },
);

export const selectBaseCustomFieldGroupIdsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getBaseCustomFieldGroupsQuerySet()
      .toRefArray()
      .map((baseCustomFieldGroup) => baseCustomFieldGroup.id);
  },
);

export const selectBaseCustomFieldGroupsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getBaseCustomFieldGroupsQuerySet()
      .toRefArray()
      .map((baseCustomFieldGroup) => ({
        ...baseCustomFieldGroup,
        isPersisted: !isLocalId(baseCustomFieldGroup.id),
      }));
  },
);

export const selectBoardIdsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project, User }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    const currentUserModel = User.withId(currentUserId);

    return projectModel
      .getBoardsModelArrayAvailableForUser(currentUserModel)
      .map((boardModel) => boardModel.id);
  },
);

export const selectIsCurrentUserManagerForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return false;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return false;
    }

    return projectModel.hasManagerWithUserId(currentUserId);
  },
);

export default {
  makeSelectProjectById,
  selectProjectById,
  makeSelectBoardIdsByProjectId,
  selectBoardIdsByProjectId,
  makeSelectFirstBoardIdByProjectId,
  selectFirstBoardIdByProjectId,
  makeSelectNotificationsTotalByProjectId,
  selectNotificationsTotalByProjectId,
  makeSelectIsProjectWithIdAvailableForCurrentUser,
  selectIsProjectWithIdAvailableForCurrentUser,
  makeSelectIsProjectWithIdExternalAccessibleForCurrentUser,
  selectIsProjectWithIdExternalAccessibleForCurrentUser,
  selectCurrentProject,
  selectManagersForCurrentProject,
  selectManagerUserIdsForCurrentProject,
  selectBackgroundImageIdsForCurrentProject,
  selectBaseCustomFieldGroupIdsForCurrentProject,
  selectBaseCustomFieldGroupsForCurrentProject,
  selectBoardIdsForCurrentProject,
  selectIsCurrentUserManagerForCurrentProject,
};
