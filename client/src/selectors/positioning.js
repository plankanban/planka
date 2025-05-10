/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import isUndefined from 'lodash/isUndefined';
import { createSelector } from 'redux-orm';

import orm from '../orm';
import Config from '../constants/Config';

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

    return nextPosition(projectModel.getBoardsQuerySet().toRefArray(), index, excludedId);
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

    return nextPosition(boardModel.getLabelsQuerySet().toRefArray(), index, excludedId);
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

    return nextPosition(boardModel.getFiniteListsQuerySet().toRefArray(), index, excludedId);
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

    return nextPosition(listModel.getFilteredCardsModelArray(), index, excludedId);
  },
);

export const selectNextTaskListPosition = createSelector(
  orm,
  (_, cardId) => cardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Card }, cardId, index, excludedId) => {
    const cardModel = Card.withId(cardId);

    if (!cardModel) {
      return cardModel;
    }

    return nextPosition(cardModel.getTaskListsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextTaskPosition = createSelector(
  orm,
  (_, taskListId) => taskListId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ TaskList }, taskListId, index, excludedId) => {
    const taskListModel = TaskList.withId(taskListId);

    if (!taskListModel) {
      return taskListModel;
    }

    return nextPosition(taskListModel.getTasksQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextCustomFieldGroupPositionInBoard = createSelector(
  orm,
  (_, cardId) => cardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Board }, boardId, index, excludedId) => {
    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return boardModel;
    }

    return nextPosition(boardModel.getCustomFieldGroupsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextCustomFieldGroupPositionInCard = createSelector(
  orm,
  (_, cardId) => cardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Card }, cardId, index, excludedId) => {
    const cardModel = Card.withId(cardId);

    if (!cardModel) {
      return cardModel;
    }

    return nextPosition(cardModel.getCustomFieldGroupsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextCustomFieldPositionInBaseGroup = createSelector(
  orm,
  (_, baseCustomFieldGroupId) => baseCustomFieldGroupId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ BaseCustomFieldGroup }, baseCustomFieldGroupId, index, excludedId) => {
    const baseCustomFieldGroupModel = BaseCustomFieldGroup.withId(baseCustomFieldGroupId);

    if (!baseCustomFieldGroupModel) {
      return baseCustomFieldGroupModel;
    }

    return nextPosition(
      baseCustomFieldGroupModel.getCustomFieldsQuerySet().toRefArray(),
      index,
      excludedId,
    );
  },
);

export const selectNextCustomFieldPositionInGroup = createSelector(
  orm,
  (_, customFieldGroupId) => customFieldGroupId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ CustomFieldGroup }, customFieldGroupId, index, excludedId) => {
    const customFieldGroupModel = CustomFieldGroup.withId(customFieldGroupId);

    if (!customFieldGroupModel) {
      return customFieldGroupModel;
    }

    return nextPosition(
      customFieldGroupModel.getCustomFieldsQuerySet().toRefArray(),
      index,
      excludedId,
    );
  },
);

export default {
  selectNextBoardPosition,
  selectNextLabelPosition,
  selectNextListPosition,
  selectNextCardPosition,
  selectNextTaskListPosition,
  selectNextTaskPosition,
  selectNextCustomFieldGroupPositionInBoard,
  selectNextCustomFieldGroupPositionInCard,
  selectNextCustomFieldPositionInBaseGroup,
  selectNextCustomFieldPositionInGroup,
};
