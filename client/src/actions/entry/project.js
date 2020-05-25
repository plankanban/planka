import EntryActionTypes from '../../constants/EntryActionTypes';

export const createProject = (data) => ({
  type: EntryActionTypes.PROJECT_CREATE,
  payload: {
    data,
  },
});

export const updateCurrentProject = (data) => ({
  type: EntryActionTypes.CURRENT_PROJECT_UPDATE,
  payload: {
    data,
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
