/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createBackgroundImageInCurrentProject = (data) => ({
  type: EntryActionTypes.BACKGROUND_IMAGE_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleBackgroundImageCreate = (backgroundImage, requestId) => ({
  type: EntryActionTypes.BACKGROUND_IMAGE_CREATE_HANDLE,
  payload: {
    backgroundImage,
    requestId,
  },
});

const deleteBackgroundImage = (id) => ({
  type: EntryActionTypes.BACKGROUND_IMAGE_DELETE,
  payload: {
    id,
  },
});

const handleBackgroundImageDelete = (backgroundImage) => ({
  type: EntryActionTypes.BACKGROUND_IMAGE_DELETE_HANDLE,
  payload: {
    backgroundImage,
  },
});

export default {
  createBackgroundImageInCurrentProject,
  handleBackgroundImageCreate,
  deleteBackgroundImage,
  handleBackgroundImageDelete,
};
