import { createSelector } from 'redux-orm';

import orm from '../orm';
import { currentUserIdSelector } from './user';

export const usersSelector = createSelector(orm, ({ User }) =>
  User.getOrderedUndeletedQuerySet().toRefArray(),
);

export const usersExceptCurrentSelector = createSelector(
  orm,
  (state) => currentUserIdSelector(state),
  ({ User }, id) =>
    User.getOrderedUndeletedQuerySet()
      .exclude({
        id,
      })
      .toRefArray(),
);
