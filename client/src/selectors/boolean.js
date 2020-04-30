import { createSelector } from 'redux-orm';

import orm from '../orm';
import { pathSelector } from './path';

export const isAnyFilterActiveForCurrentBoardSelector = createSelector(
  orm,
  (state) => pathSelector(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return false;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return false;
    }

    return boardModel.filterUsers.exists() || boardModel.filterLabels.exists();
  },
);

export const isAttachmentWithIdExistsSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Attachment }, id) => Attachment.idExists(id),
  );
