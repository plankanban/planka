import { createSelector } from 'redux-orm';

import orm from '../orm';
import { pathSelector } from './path';
import { isLocalId } from '../utils/local-id';

export const currentModalSelector = ({ app: { currentModal } }) => currentModal;

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

    return userModel
      .getOrderedProjectMembershipsQuerySet()
      .toModelArray()
      .map(({ project: projectModel }) => {
        let notificationsTotal = 0;
        projectModel.boards.toModelArray().forEach((boardModel) => {
          boardModel.cards.toModelArray().forEach((cardModel) => {
            notificationsTotal += cardModel.getUnreadNotificationsQuerySet().count();
          });
        });

        const firstBoard = projectModel.boards.first();
        const firstBoardId = firstBoard && firstBoard.id;

        return {
          ...projectModel.ref,
          notificationsTotal,
          firstBoardId,
        };
      });
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

export const currentProjectSelector = createSelector(
  orm,
  (state) => pathSelector(state).projectId,
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

export const membershipsForCurrentProjectSelector = createSelector(
  orm,
  (state) => pathSelector(state).projectId,
  (state) => currentUserIdSelector(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getOrderedMembershipsQuerySet()
      .toModelArray()
      .map((projectMembershipModel) => ({
        ...projectMembershipModel.ref,
        isPersisted: !isLocalId(projectMembershipModel.id),
        user: {
          ...projectMembershipModel.user.ref,
          isCurrent: projectMembershipModel.user.id === currentUserId,
        },
      }));
  },
);

export const boardsForCurrentProjectSelector = createSelector(
  orm,
  (state) => pathSelector(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getOrderedBoardsQuerySet()
      .toRefArray()
      .map((board) => ({
        ...board,
        isPersisted: !isLocalId(board.id),
      }));
  },
);

export const currentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.ref;
  },
);

export const listIdsForCurrentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getOrderedListsQuerySet()
      .toRefArray()
      .map((list) => list.id);
  },
);

export const labelsForCurrentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.labels.toRefArray().map((label) => ({
      ...label,
      isPersisted: !isLocalId(label.id),
    }));
  },
);

export const filterUsersForCurrentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterUsers.toRefArray();
  },
);

export const filterLabelsForCurrentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterLabels.toRefArray();
  },
);

export const currentCardSelector = createSelector(
  orm,
  (state) => pathSelector(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel.ref;
  },
);

export const usersForCurrentCardSelector = createSelector(
  orm,
  (state) => pathSelector(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel.users.toRefArray();
  },
);

export const labelsForCurrentCardSelector = createSelector(
  orm,
  (state) => pathSelector(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel.labels.toRefArray();
  },
);

export const tasksForCurrentCardSelector = createSelector(
  orm,
  (state) => pathSelector(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getOrderedTasksQuerySet()
      .toRefArray()
      .map((task) => ({
        ...task,
        isPersisted: !isLocalId(task.id),
      }));
  },
);

export const attachmentsForCurrentCardSelector = createSelector(
  orm,
  (state) => pathSelector(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getOrderedAttachmentsQuerySet()
      .toRefArray()
      .map((attachment) => ({
        ...attachment,
        isPersisted: !isLocalId(attachment.id),
      }));
  },
);

export const actionsForCurrentCardSelector = createSelector(
  orm,
  (state) => pathSelector(state).cardId,
  (state) => currentUserIdSelector(state),
  ({ Card }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getOrderedInCardActionsQuerySet()
      .toModelArray()
      .map((actionModel) => ({
        ...actionModel.ref,
        isPersisted: !isLocalId(actionModel.id),
        user: {
          ...actionModel.user.ref,
          isCurrent: actionModel.user.id === currentUserId,
        },
      }));
  },
);

export const notificationIdsForCurrentCardSelector = createSelector(
  orm,
  (state) => pathSelector(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getUnreadNotificationsQuerySet()
      .toRefArray()
      .map((notification) => notification.id);
  },
);
