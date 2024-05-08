import { createSelector } from 'redux-orm';
import isUndefined from 'lodash/isUndefined';

import orm from '../orm';
import Config from '../constants/Config';

export const selectAccessToken = ({ auth: { accessToken } }) => accessToken;

export const selectIsLogouting = ({ core: { isLogouting } }) => isLogouting;

const nextPosition = (items, index, excludedId) => {
  const filteredItems = isUndefined(excludedId)
    ? items
    : items.filter((item) => item.id !== excludedId);

  if (isUndefined(index)) {
    const lastItem = filteredItems[filteredItems.length - 1];

    return (lastItem ? lastItem.position : 0) + Config.POSITION_GAP;
  }

  const prevItem = filteredItems[index - 1];
  const nextItem = filteredItems[index];

  const prevPosition = prevItem ? prevItem.position : 0;

  if (!nextItem) {
    return prevPosition + Config.POSITION_GAP;
  }

  return prevPosition + (nextItem.position - prevPosition) / 2;
};

export const selectNextBoardPosition = createSelector(
  orm,
  (_, projectId) => projectId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Project }, projectId, index, excludedId) => {
    const projectModel = Project.withId(projectId);

    if (!projectModel) {
      return projectModel;
    }

    return nextPosition(projectModel.getOrderedBoardsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextLabelPosition = createSelector(
  orm,
  (_, boardId) => boardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Board }, boardId, index, excludedId) => {
    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return boardModel;
    }

    return nextPosition(boardModel.getOrderedLabelsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextListPosition = createSelector(
  orm,
  (_, boardId) => boardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Board }, boardId, index, excludedId) => {
    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return boardModel;
    }

    return nextPosition(boardModel.getOrderedListsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextCardPosition = createSelector(
  orm,
  (_, listId) => listId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ List }, listId, index, excludedId) => {
    const listModel = List.withId(listId);

    if (!listModel) {
      return listModel;
    }

    return nextPosition(listModel.getFilteredOrderedCardsModelArray(), index, excludedId);
  },
);

export const selectNextTaskPosition = createSelector(
  orm,
  (_, cardId) => cardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Card }, cardId, index, excludedId) => {
    const cardModel = Card.withId(cardId);

    if (!cardModel) {
      return cardModel;
    }

    return nextPosition(cardModel.getOrderedTasksQuerySet().toRefArray(), index, excludedId);
  },
);

export default {
  selectAccessToken,
  selectIsLogouting,
  selectNextBoardPosition,
  selectNextLabelPosition,
  selectNextListPosition,
  selectNextCardPosition,
  selectNextTaskPosition,
};
