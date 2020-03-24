import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeBoardByIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Board }, id) => {
      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return boardModel.ref;
    },
  );

export const makeListByIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return {
        ...listModel.ref,
        isPersisted: !isLocalId(id),
      };
    },
  );

export const makeCardIdsByListIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getOrderedFilteredCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

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
        isPersisted: !isLocalId(id),
      };
    },
  );

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

export const boardByIdSelector = makeBoardByIdSelector();

export const listByIdSelector = makeListByIdSelector();

export const cardIdsByListIdSelector = makeCardIdsByListIdSelector();

export const cardByIdSelector = makeCardByIdSelector();

export const usersByCardIdSelector = makeUsersByCardIdSelector();

export const labelsByCardIdSelector = makeLabelsByCardIdSelector();

export const tasksByCardIdSelector = makeTasksByCardIdSelector();

export const lastActionIdByCardIdSelector = makeLastActionIdByCardIdSelector();

export const notificationsTotalByCardIdSelector = makeNotificationsTotalByCardIdSelector();
