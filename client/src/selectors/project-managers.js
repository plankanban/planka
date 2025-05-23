/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectProjectManagerById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ ProjectManager }, id) => {
      const projectManagerModel = ProjectManager.withId(id);

      if (!projectManagerModel) {
        return projectManagerModel;
      }

      return projectManagerModel.ref;
    },
  );

export const selectProjectManagerById = makeSelectProjectManagerById();

export default {
  makeSelectProjectManagerById,
  selectProjectManagerById,
};
