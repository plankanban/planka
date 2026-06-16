/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from "redux-orm";

import orm from "../orm";
import { selectPath } from "./router";
import { isLocalId } from "../utils/local-id";

export const makeSelectProjectLabelById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ ProjectLabel }, id) => {
      const projectLabelModel = ProjectLabel.withId(id);

      if (!projectLabelModel) {
        return projectLabelModel;
      }

      return {
        ...projectLabelModel.ref,
        isPersisted: !isLocalId(projectLabelModel.id),
      };
    },
  );

export const selectProjectLabelById = makeSelectProjectLabelById();

export const selectProjectLabelsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel.labels
      .orderBy(["position", "id.length", "id"])
      .toRefArray()
      .map((projectLabel) => ({
        ...projectLabel,
        isPersisted: !isLocalId(projectLabel.id),
      }));
  },
);

export default {
  makeSelectProjectLabelById,
  selectProjectLabelById,
  selectProjectLabelsForCurrentProject,
};
