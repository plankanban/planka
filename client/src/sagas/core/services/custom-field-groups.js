/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createCustomFieldGroupInBoard(boardId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextCustomFieldGroupPositionInBoard, boardId),
  };

  yield put(
    actions.createCustomFieldGroup({
      ...nextData,
      boardId,
      id: localId,
    }),
  );

  let customFieldGroup;
  try {
    ({ item: customFieldGroup } = yield call(
      request,
      api.createBoardCustomFieldGroup,
      boardId,
      nextData,
    ));
  } catch (error) {
    yield put(actions.createCustomFieldGroup.failure(localId, error));
    return;
  }

  yield put(actions.createCustomFieldGroup.success(localId, customFieldGroup));
}

export function* createCustomFieldGroupInCurrentBoard(data) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(createCustomFieldGroupInBoard, boardId, data);
}

export function* createCustomFieldGroupInCard(cardId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextCustomFieldGroupPositionInCard, cardId),
  };

  yield put(
    actions.createCustomFieldGroup({
      ...nextData,
      cardId,
      id: localId,
    }),
  );

  let customFieldGroup;
  try {
    ({ item: customFieldGroup } = yield call(
      request,
      api.createCardCustomFieldGroup,
      cardId,
      nextData,
    ));
  } catch (error) {
    yield put(actions.createCustomFieldGroup.failure(localId, error));
    return;
  }

  yield put(actions.createCustomFieldGroup.success(localId, customFieldGroup));
}

export function* createCustomFieldGroupInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createCustomFieldGroupInCard, cardId, data);
}

export function* handleCustomFieldGroupCreate(customFieldGroup) {
  yield put(actions.handleCustomFieldGroupCreate(customFieldGroup));
}

export function* updateCustomFieldGroup(id, data) {
  yield put(actions.updateCustomFieldGroup(id, data));

  let customFieldGroup;
  try {
    ({ item: customFieldGroup } = yield call(request, api.updateCustomFieldGroup, id, data));
  } catch (error) {
    yield put(actions.updateCustomFieldGroup.failure(id, error));
    return;
  }

  yield put(actions.updateCustomFieldGroup.success(customFieldGroup));
}

export function* handleCustomFieldGroupUpdate(customFieldGroup) {
  yield put(actions.handleCustomFieldGroupUpdate(customFieldGroup));
}

export function* moveCustomFieldGroup(id, index) {
  const customFieldGroup = yield select(selectors.selectCustomFieldGroupById, id);

  let position;
  if (customFieldGroup.boardId) {
    position = yield select(
      selectors.selectNextCustomFieldGroupPositionInBoard,
      customFieldGroup.boardId,
      index,
      id,
    );
  } else if (customFieldGroup.cardId) {
    position = yield select(
      selectors.selectNextCustomFieldGroupPositionInCard,
      customFieldGroup.cardId,
      index,
      id,
    );
  }

  yield call(updateCustomFieldGroup, id, {
    position,
  });
}

export function* deleteCustomFieldGroup(id) {
  yield put(actions.deleteCustomFieldGroup(id));

  let customFieldGroup;
  try {
    ({ item: customFieldGroup } = yield call(request, api.deleteCustomFieldGroup, id));
  } catch (error) {
    yield put(actions.deleteCustomFieldGroup.failure(id, error));
    return;
  }

  yield put(actions.deleteCustomFieldGroup.success(customFieldGroup));
}

export function* handleCustomFieldGroupDelete(customFieldGroup) {
  yield put(actions.handleCustomFieldGroupDelete(customFieldGroup));
}

export default {
  createCustomFieldGroupInBoard,
  createCustomFieldGroupInCurrentBoard,
  createCustomFieldGroupInCard,
  createCustomFieldGroupInCurrentCard,
  handleCustomFieldGroupCreate,
  updateCustomFieldGroup,
  handleCustomFieldGroupUpdate,
  moveCustomFieldGroup,
  deleteCustomFieldGroup,
  handleCustomFieldGroupDelete,
};
