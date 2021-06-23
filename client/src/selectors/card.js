import { createSelector } from 'redux-orm';

import orm from '../orm';
import { pathSelector } from './router';
import { currentUserIdSelector } from './user';
import { isLocalId } from '../utils/local-id';

export const makeCardByIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return {
        ...cardModel.ref,
        coverUrl: cardModel.coverAttachment && cardModel.coverAttachment.coverUrl,
        isPersisted: !isLocalId(id),
      };
    },
  );

export const cardByIdSelector = makeCardByIdSelector();

export const makeUsersByCardIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.users.toRefArray();
    },
  );

export const usersByCardIdSelector = makeUsersByCardIdSelector();

export const makeLabelsByCardIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.labels.toRefArray();
    },
  );

export const labelsByCardIdSelector = makeLabelsByCardIdSelector();

export const makeTasksByCardIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.tasks.toRefArray();
    },
  );

export const tasksByCardIdSelector = makeTasksByCardIdSelector();

export const makeLastActionIdByCardIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const lastActionModel = cardModel.getOrderedInCardActionsQuerySet().last();

      return lastActionModel && lastActionModel.id;
    },
  );

export const lastActionIdByCardIdSelector = makeLastActionIdByCardIdSelector();

export const makeNotificationsByCardIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.getUnreadNotificationsQuerySet().toRefArray();
    },
  );

export const notificationsByCardIdSelector = makeNotificationsByCardIdSelector();

export const makeNotificationsTotalByCardIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.getUnreadNotificationsQuerySet().count();
    },
  );

export const notificationsTotalByCardIdSelector = makeNotificationsTotalByCardIdSelector();

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
        isCover: attachment.id === cardModel.coverAttachmentId,
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
