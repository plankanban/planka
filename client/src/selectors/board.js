import { createSelector } from 'redux-orm';

import orm from '../orm';
import { pathSelector } from './router';
import { currentUserIdSelector } from './user';
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

export const boardByIdSelector = makeBoardByIdSelector();

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

export const membershipsForCurrentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  (state) => currentUserIdSelector(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getOrderedMembershipsQuerySet()
      .toModelArray()
      .map((boardMembershipModel) => ({
        ...boardMembershipModel.ref,
        isPersisted: !isLocalId(boardMembershipModel.id),
        user: {
          ...boardMembershipModel.user.ref,
          isCurrent: boardMembershipModel.user.id === currentUserId,
        },
      }));
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

export const isCurrentUserMemberForCurrentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  (state) => currentUserIdSelector(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return false;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return false;
    }

    return boardModel.hasMemberUser(currentUserId);
  },
);
