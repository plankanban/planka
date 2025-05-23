/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectActivityById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Activity }, id) => {
      const activityModel = Activity.withId(id);

      if (!activityModel) {
        return activityModel;
      }

      return {
        ...activityModel.ref,
        isPersisted: !isLocalId(activityModel.id),
      };
    },
  );

export const selectActivityById = makeSelectActivityById();

export default {
  makeSelectActivityById,
  selectActivityById,
};
