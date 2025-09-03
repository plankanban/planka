/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import {
  selectIsFavoritesEnabled,
  selectIsHiddenProjectsVisible,
  selectProjectsOrder,
  selectProjectsSearch,
} from './core';
import { isLocalId } from '../utils/local-id';
import { isUserAdminOrProjectOwner } from '../utils/record-helpers';
import { STATIC_USER_BY_ID } from '../constants/StaticUsers';
import { BoardMembershipRoles, ProjectGroups, ProjectOrders } from '../constants/Enums';

const ORDER_BY_ARGS_BY_PROJECTS_ORDER = {
  [ProjectOrders.ALPHABETICALLY]: [['name', 'id.length', 'id']],
  [ProjectOrders.BY_CREATION_TIME]: [['id', 'id.length']],
};

export const selectCurrentUserId = ({ auth: { userId } }) => userId;

export const makeSelectUserById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ User }, id) => {
      if (STATIC_USER_BY_ID[id]) {
        return STATIC_USER_BY_ID[id];
      }

      const userModel = User.withId(id);

      if (!userModel) {
        return userModel;
      }

      return userModel.ref;
    },
  );

export const selectUserById = makeSelectUserById();

export const selectUsersExceptCurrent = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) =>
    User.getAllQuerySet()
      .exclude({
        id,
      })
      .toRefArray(),
);

export const selectActiveUsers = createSelector(orm, ({ User }) =>
  User.getActiveQuerySet().toRefArray(),
);

export const selectActiveUsersTotal = createSelector(orm, ({ User }) =>
  User.getActiveQuerySet().count(),
);

export const selectActiveAdminOrProjectOwnerUsers = createSelector(orm, ({ User }) =>
  User.getActiveQuerySet()
    .filter((user) => isUserAdminOrProjectOwner(user))
    .toRefArray(),
);

export const selectCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.ref;
  },
);

export const selectProjectIdsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.getProjectsModelArray().map((projectModel) => projectModel.id);
  },
);

export const selectFilteredProjectIdsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (state) => selectProjectsSearch(state),
  (state) => selectIsHiddenProjectsVisible(state),
  (state) => selectProjectsOrder(state),
  ({ User }, id, projectsSearch, isHiddenProjectsVisible, projectsOrder) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel
      .getFilteredProjectsModelArray(
        projectsSearch,
        isHiddenProjectsVisible,
        ORDER_BY_ARGS_BY_PROJECTS_ORDER[projectsOrder],
      )
      .map((projectModel) => projectModel.id);
  },
);

export const selectFilteredProjctIdsByGroupForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (state) => selectProjectsSearch(state),
  (state) => selectIsHiddenProjectsVisible(state),
  (state) => selectProjectsOrder(state),
  ({ User }, id, projectsSearch, isHiddenProjectsVisible, projectsOrder) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    const { managerProjectModels, membershipProjectModels, adminProjectModels } =
      userModel.getFilteredSeparatedProjectsModelArray(
        projectsSearch,
        isHiddenProjectsVisible,
        ORDER_BY_ARGS_BY_PROJECTS_ORDER[projectsOrder],
      );

    return managerProjectModels.reduce(
      (result, projectModel) => {
        const group = projectModel.ownerProjectManager ? ProjectGroups.MY_OWN : ProjectGroups.TEAM;

        result[group].push(projectModel.id);
        return result;
      },
      {
        [ProjectGroups.MY_OWN]: [],
        [ProjectGroups.TEAM]: [],
        [ProjectGroups.SHARED_WITH_ME]: membershipProjectModels.map(
          (projectModel) => projectModel.id,
        ),
        [ProjectGroups.OTHERS]: adminProjectModels.map((projectModel) => projectModel.id),
      },
    );
  },
);

export const selectFavoriteProjectIdsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (state) => selectProjectsOrder(state),
  ({ User }, id, projectsOrder) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel
      .getFavoriteProjectsModelArray(ORDER_BY_ARGS_BY_PROJECTS_ORDER[projectsOrder])
      .map((projectModel) => projectModel.id);
  },
);

export const selectProjectsToBoardsWithEditorRightsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.getMembershipProjectsModelArray().map((projectModel) => ({
      ...projectModel.ref,
      boards: projectModel.getBoardsModelArrayForUserWithId(id).flatMap((boardModel) => {
        const boardMembersipModel = boardModel.getMembershipModelByUserId(id);

        if (boardMembersipModel.role !== BoardMembershipRoles.EDITOR) {
          return [];
        }

        return boardModel.ref;
      }),
    }));
  },
);

export const selectProjectsToListsWithEditorRightsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.getMembershipProjectsModelArray().map((projectModel) => ({
      ...projectModel.ref,
      boards: projectModel.getBoardsModelArrayForUserWithId(id).flatMap((boardModel) => {
        const boardMembersipModel = boardModel.getMembershipModelByUserId(id);

        if (boardMembersipModel.role !== BoardMembershipRoles.EDITOR) {
          return [];
        }

        return {
          ...boardModel.ref,
          lists: boardModel
            .getListsQuerySet()
            .toRefArray()
            .map((list) => ({
              ...list,
              isPersisted: !isLocalId(list.id),
            })),
        };
      }),
    }));
  },
);

export const selectBoardIdsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel
      .getProjectsModelArray()
      .flatMap((projectModel) =>
        projectModel
          .getBoardsModelArrayAvailableForUser(userModel)
          .map((boardModel) => boardModel.id),
      );
  },
);

export const selectNotificationIdsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel
      .getUnreadNotificationsQuerySet()
      .toRefArray()
      .map((notification) => notification.id);
  },
);

export const selectNotificationServiceIdsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel
      .getNotificationServicesQuerySet()
      .toRefArray()
      .map((notificationService) => notificationService.id);
  },
);

export const selectIsFavoritesActiveForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (state) => selectIsFavoritesEnabled(state),
  ({ User }, id, isFavoritesEnabled) => {
    if (!id) {
      return false;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return false;
    }

    // TODO: use selectFavoriteProjectIdsForCurrentUser instead
    return isFavoritesEnabled && userModel.getFavoriteProjectsModelArray().length > 0;
  },
);

export default {
  makeSelectUserById,
  selectUserById,
  selectCurrentUserId,
  selectUsersExceptCurrent,
  selectActiveUsers,
  selectActiveUsersTotal,
  selectActiveAdminOrProjectOwnerUsers,
  selectCurrentUser,
  selectProjectIdsForCurrentUser,
  selectFilteredProjectIdsForCurrentUser,
  selectFilteredProjctIdsByGroupForCurrentUser,
  selectFavoriteProjectIdsForCurrentUser,
  selectProjectsToBoardsWithEditorRightsForCurrentUser,
  selectProjectsToListsWithEditorRightsForCurrentUser,
  selectBoardIdsForCurrentUser,
  selectNotificationIdsForCurrentUser,
  selectNotificationServiceIdsForCurrentUser,
  selectIsFavoritesActiveForCurrentUser,
};
