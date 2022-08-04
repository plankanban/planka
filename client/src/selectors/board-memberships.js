import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectBoardMembershipById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ BoardMembership }, id) => {
      const boardMembershipModel = BoardMembership.withId(id);

      if (!boardMembershipModel) {
        return boardMembershipModel;
      }

      return boardMembershipModel.ref;
    },
  );

export const selectBoardMembershipById = makeSelectBoardMembershipById();

export default {
  makeSelectBoardMembershipById,
  selectBoardMembershipById,
};
