/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* backgroundImagesWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.BACKGROUND_IMAGE_IN_CURRENT_PROJECT_CREATE,
      ({ payload: { data } }) => services.createBackgroundImageInCurrentProject(data),
    ),
    takeEvery(
      EntryActionTypes.BACKGROUND_IMAGE_CREATE_HANDLE,
      ({ payload: { backgroundImage, requestId } }) =>
        services.handleBackgroundImageCreate(backgroundImage, requestId),
    ),
    takeEvery(EntryActionTypes.BACKGROUND_IMAGE_DELETE, ({ payload: { id } }) =>
      services.deleteBackgroundImage(id),
    ),
    takeEvery(EntryActionTypes.BACKGROUND_IMAGE_DELETE_HANDLE, ({ payload: { backgroundImage } }) =>
      services.handleBackgroundImageDelete(backgroundImage),
    ),
  ]);
}
