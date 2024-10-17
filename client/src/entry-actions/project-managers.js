import EntryActionTypes from '../constants/EntryActionTypes';

const createManagerInCurrentProject = (data) => ({
  type: EntryActionTypes.MANAGER_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleProjectManagerCreate = (projectManager) => ({
  type: EntryActionTypes.PROJECT_MANAGER_CREATE_HANDLE,
  payload: {
    projectManager,
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
