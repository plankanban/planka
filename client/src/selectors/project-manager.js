import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeProjectManagerByIdSelector = () =>
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

export const projectManagerByIdSelector = makeProjectManagerByIdSelector();
