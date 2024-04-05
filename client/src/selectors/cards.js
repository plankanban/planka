import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';
import { isLocalId } from '../utils/local-id';

export const makeSelectCardById = () =>
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

export const selectCardById = makeSelectCardById();

export const makeSelectCardIndexById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const cardModels = cardModel.list.getFilteredOrderedCardsModelArray();
      return cardModels.findIndex((cardModelItem) => cardModelItem.id === cardModel.id);
    },
  );

export const selectCardIndexById = makeSelectCardIndexById();

export const makeSelectUsersByCardId = () =>
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

export const selectUsersByCardId = makeSelectUsersByCardId();

export const makeSelectLabelsByCardId = () =>
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

export const selectLabelsByCardId = makeSelectLabelsByCardId();

export const makeSelectTaskIdsByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel
        .getOrderedTasksQuerySet()
        .toRefArray()
        .map((task) => task.id);
    },
  );

export const selectTaskIdsByCardId = makeSelectTaskIdsByCardId();

export const makeSelectTasksByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.getOrderedTasksQuerySet().toRefArray();
    },
  );

export const selectTasksByCardId = makeSelectTasksByCardId();

export const makeSelectLastActivityIdByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const lastActivityModel = cardModel.getFilteredOrderedInCardActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
    },
  );

export const selectLastActivityIdByCardId = makeSelectLastActivityIdByCardId();

export const makeSelectNotificationsByCardId = () =>
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

export const selectNotificationsByCardId = makeSelectNotificationsByCardId();

export const makeSelectNotificationsTotalByCardId = () =>
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

export const selectNotificationsTotalByCardId = makeSelectNotificationsTotalByCardId();

export const selectCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
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

export const selectUsersForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
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

export const selectLabelsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
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

export const selectTasksForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
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

export const selectAttachmentsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
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

export const selectActivitiesForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  (state) => selectCurrentUserId(state),
  ({ Card }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getFilteredOrderedInCardActivitiesQuerySet()
      .toModelArray()
      .map((activityModel) => ({
        ...activityModel.ref,
        isPersisted: !isLocalId(activityModel.id),
        user: {
          ...activityModel.user.ref,
          isCurrent: activityModel.user.id === currentUserId,
        },
      }));
  },
);

export const selectNotificationIdsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
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

export default {
  makeSelectCardById,
  selectCardById,
  makeSelectCardIndexById,
  selectCardIndexById,
  makeSelectUsersByCardId,
  selectUsersByCardId,
  makeSelectLabelsByCardId,
  selectLabelsByCardId,
  makeSelectTaskIdsByCardId,
  selectTaskIdsByCardId,
  makeSelectTasksByCardId,
  selectTasksByCardId,
  makeSelectLastActivityIdByCardId,
  selectLastActivityIdByCardId,
  makeSelectNotificationsByCardId,
  selectNotificationsByCardId,
  makeSelectNotificationsTotalByCardId,
  selectNotificationsTotalByCardId,
  selectCurrentCard,
  selectUsersForCurrentCard,
  selectLabelsForCurrentCard,
  selectTasksForCurrentCard,
  selectAttachmentsForCurrentCard,
  selectActivitiesForCurrentCard,
  selectNotificationIdsForCurrentCard,
};
