/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createProjectLabelInCurrentProject = (data) => ({
  type: EntryActionTypes.PROJECT_LABEL_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleProjectLabelCreate = (projectLabel) => ({
  type: EntryActionTypes.PROJECT_LABEL_CREATE_HANDLE,
  payload: {
    projectLabel,
  },
});

const updateProjectLabel = (id, data) => ({
  type: EntryActionTypes.PROJECT_LABEL_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleProjectLabelUpdate = (projectLabel) => ({
  type: EntryActionTypes.PROJECT_LABEL_UPDATE_HANDLE,
  payload: {
    projectLabel,
  },
});

const moveProjectLabel = (id, index) => ({
  type: EntryActionTypes.PROJECT_LABEL_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteProjectLabel = (id) => ({
  type: EntryActionTypes.PROJECT_LABEL_DELETE,
  payload: {
    id,
  },
});

const handleProjectLabelDelete = (projectLabel) => ({
  type: EntryActionTypes.PROJECT_LABEL_DELETE_HANDLE,
  payload: {
    projectLabel,
  },
});

export default {
  createProjectLabelInCurrentProject,
  handleProjectLabelCreate,
  updateProjectLabel,
  handleProjectLabelUpdate,
  moveProjectLabel,
  deleteProjectLabel,
  handleProjectLabelDelete,
};
