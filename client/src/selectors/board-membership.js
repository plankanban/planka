import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeBoardMembershipByIdSelector = () =>
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

export const boardMembershipByIdSelector = makeBoardMembershipByIdSelector();
