import EntryActionTypes from '../../constants/EntryActionTypes';

export const createProject = (data) => ({
  type: EntryActionTypes.PROJECT_CREATE,
  payload: {
    data,
  },
});

export const handleProjectCreate = (project) => ({
  type: EntryActionTypes.PROJECT_CREATE_HANDLE,
  payload: {
    project,
  },
});

export const updateCurrentProject = (data) => ({
  type: EntryActionTypes.CURRENT_PROJECT_UPDATE,
  payload: {
    data,
  },
});

export const handleProjectUpdate = (project) => ({
  type: EntryActionTypes.PROJECT_UPDATE_HANDLE,
  payload: {
    project,
  },
});

export const updateCurrentProjectBackgroundImage = (data) => ({
  type: EntryActionTypes.CURRENT_PROJECT_BACKGROUND_IMAGE_UPDATE,
  payload: {
    data,
  },
});

export const deleteCurrentProject = () => ({
  type: EntryActionTypes.CURRENT_PROJECT_DELETE,
  payload: {},
});

export const handleProjectDelete = (project) => ({
  type: EntryActionTypes.PROJECT_DELETE_HANDLE,
  payload: {
    project,
  },
});
