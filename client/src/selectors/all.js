import { createSelector } from 'redux-orm';

import orm from '../orm';
import { dbSelector } from './common';
import { currentUserIdSelector } from './current';

export const allUsersSelector = createSelector(
  orm,
  dbSelector,
  ({ User }) => User.getOrderedUndeletedQuerySet().toRefArray(),
);

export const allUsersExceptCurrentSelector = createSelector(
  orm,
  dbSelector,
  (state) => currentUserIdSelector(state),
  ({ User }, currentUserId) => User.getOrderedUndeletedQuerySet()
    .exclude({
      id: currentUserId,
    })
    .toRefArray(),
);
