/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createManagerInCurrentProject = (data) => ({
  type: EntryActionTypes.MANAGER_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleProjectManagerCreate = (projectManager, users) => ({
  type: EntryActionTypes.PROJECT_MANAGER_CREATE_HANDLE,
  payload: {
    projectManager,
    users,
  },
});

const deleteProjectManager = (id) => ({
  type: EntryActionTypes.PROJECT_MANAGER_DELETE,
  payload: {
    id,
  },
});

const handleProjectManagerDelete = (projectManager) => ({
  type: EntryActionTypes.PROJECT_MANAGER_DELETE_HANDLE,
  payload: {
    projectManager,
  },
});

export default {
  createManagerInCurrentProject,
  handleProjectManagerCreate,
  deleteProjectManager,
  handleProjectManagerDelete,
};
