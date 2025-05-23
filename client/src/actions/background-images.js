/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createBackgroundImage = (backgroundImage) => ({
  type: ActionTypes.BACKGROUND_IMAGE_CREATE,
  payload: {
    backgroundImage,
  },
});

createBackgroundImage.success = (localId, backgroundImage) => ({
  type: ActionTypes.BACKGROUND_IMAGE_CREATE__SUCCESS,
  payload: {
    localId,
    backgroundImage,
  },
});

createBackgroundImage.failure = (localId, error) => ({
  type: ActionTypes.BACKGROUND_IMAGE_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleBackgroundImageCreate = (backgroundImage) => ({
  type: ActionTypes.BACKGROUND_IMAGE_CREATE_HANDLE,
  payload: {
    backgroundImage,
  },
});

const deleteBackgroundImage = (id) => ({
  type: ActionTypes.BACKGROUND_IMAGE_DELETE,
  payload: {
    id,
  },
});

deleteBackgroundImage.success = (backgroundImage) => ({
  type: ActionTypes.BACKGROUND_IMAGE_DELETE__SUCCESS,
  payload: {
    backgroundImage,
  },
});

deleteBackgroundImage.failure = (id, error) => ({
  type: ActionTypes.BACKGROUND_IMAGE_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBackgroundImageDelete = (backgroundImage) => ({
  type: ActionTypes.BACKGROUND_IMAGE_DELETE_HANDLE,
  payload: {
    backgroundImage,
  },
});

export default {
  createBackgroundImage,
  handleBackgroundImageCreate,
  deleteBackgroundImage,
  handleBackgroundImageDelete,
};
