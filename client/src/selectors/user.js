import { createSelector } from 'redux-orm';

import orm from '../orm';

export const currentUserIdSelector = ({ auth: { userId } }) => userId;

export const currentUserSelector = createSelector(
  orm,
  (state) => currentUserIdSelector(state),
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

export const projectsForCurrentUserSelector = createSelector(
  orm,
  (state) => currentUserIdSelector(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.getOrderedAvailableProjectsModelArray().map((projectModel) => {
      const boardsModels = projectModel.getOrderedAvailableBoardsModelArray(userModel.id);

      let notificationsTotal = 0;
      boardsModels.forEach((boardModel) => {
        boardModel.cards.toModelArray().forEach((cardModel) => {
          notificationsTotal += cardModel.getUnreadNotificationsQuerySet().count();
        });
      });

      return {
        ...projectModel.ref,
        notificationsTotal,
        firstBoardId: boardsModels[0] && boardsModels[0].id,
      };
    });
  },
);

export const projectsToListsForCurrentUserSelector = createSelector(
  orm,
  (state) => currentUserIdSelector(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.getOrderedAvailableProjectsModelArray().map((projectModel) => ({
      ...projectModel.ref,
      boards: projectModel.getOrderedMemberBoardsModelArray(id).map((boardModel) => ({
        ...boardModel.ref,
        lists: boardModel.getOrderedListsQuerySet().toRefArray(),
      })),
    }));
  },
);

export const notificationsForCurrentUserSelector = createSelector(
  orm,
  (state) => currentUserIdSelector(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel
      .getOrderedUnreadNotificationsQuerySet()
      .toModelArray()
      .map((notificationModel) => ({
        ...notificationModel.ref,
        action: notificationModel.action && {
          ...notificationModel.action.ref,
          user: notificationModel.action.user.ref,
        },
        card: notificationModel.card && notificationModel.card.ref,
      }));
  },
);
