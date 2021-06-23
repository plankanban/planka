import EntryActionTypes from '../../constants/EntryActionTypes';

export const createManagerInCurrentProject = (data) => ({
  type: EntryActionTypes.MANAGER_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

export const handleProjectManagerCreate = (projectManager) => ({
  type: EntryActionTypes.PROJECT_MANAGER_CREATE_HANDLE,
  payload: {
    projectManager,
  },
});

export const deleteProjectManager = (id) => ({
  type: EntryActionTypes.PROJECT_MANAGER_DELETE,
  payload: {
    id,
  },
});

export const handleProjectManagerDelete = (projectManager) => ({
  type: EntryActionTypes.PROJECT_MANAGER_DELETE_HANDLE,
  payload: {
    projectManager,
  },
});
