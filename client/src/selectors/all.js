import { createSelector } from 'redux-orm';

import orm from '../orm';
import { currentUserIdSelector } from './current';

export const allUsersSelector = createSelector(orm, ({ User }) =>
  User.getOrderedUndeletedQuerySet().toRefArray(),
);

export const allUsersExceptCurrentSelector = createSelector(
  orm,
  (state) => currentUserIdSelector(state),
  ({ User }, currentUserId) =>
    User.getOrderedUndeletedQuerySet()
      .exclude({
        id: currentUserId,
      })
      .toRefArray(),
);
