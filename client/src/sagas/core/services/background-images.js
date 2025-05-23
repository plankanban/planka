/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import omit from 'lodash/omit';
import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createBackgroundImage(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createBackgroundImage({
      ...omit(data, ['file', 'url']),
      projectId,
      id: localId,
    }),
  );

  let backgroundImage;
  try {
    ({ item: backgroundImage } = yield call(
      request,
      api.createBackgroundImage,
      projectId,
      data,
      localId,
    ));
  } catch (error) {
    yield put(actions.createBackgroundImage.failure(localId, error));
    return;
  }

  yield put(actions.createBackgroundImage.success(localId, backgroundImage));
}

export function* createBackgroundImageInCurrentProject(data) {
  const { projectId } = yield select(selectors.selectPath);

  yield call(createBackgroundImage, projectId, data);
}

export function* handleBackgroundImageCreate(backgroundImage, requestId) {
  const isExists = yield select(selectors.selectIsBackgroundImageWithIdExists, requestId);

  if (!isExists) {
    yield put(actions.handleBackgroundImageCreate(backgroundImage));
  }
}

export function* deleteBackgroundImage(id) {
  yield put(actions.deleteBackgroundImage(id));

  let backgroundImage;
  try {
    ({ item: backgroundImage } = yield call(request, api.deleteBackgroundImage, id));
  } catch (error) {
    yield put(actions.deleteBackgroundImage.failure(id, error));
    return;
  }

  yield put(actions.deleteBackgroundImage.success(backgroundImage));
}

export function* handleBackgroundImageDelete(backgroundImage) {
  yield put(actions.handleBackgroundImageDelete(backgroundImage));
}

export default {
  createBackgroundImage,
  createBackgroundImageInCurrentProject,
  handleBackgroundImageCreate,
  deleteBackgroundImage,
  handleBackgroundImageDelete,
};
