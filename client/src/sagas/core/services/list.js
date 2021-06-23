import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { listByIdSelector, nextListPositionSelector, pathSelector } from '../../../selectors';
import {
  createList,
  deleteList,
  handleListCreate,
  handleListDelete,
  handleListUpdate,
  updateList,
} from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createListService(boardId, data) {
  const nextData = {
    ...data,
    position: yield select(nextListPositionSelector, boardId),
  };

  const localId = yield call(createLocalId);

  yield put(
    createList({
      ...nextData,
      boardId,
      id: localId,
    }),
  );

  let list;
  try {
    ({ item: list } = yield call(request, api.createList, boardId, nextData));
  } catch (error) {
    yield put(createList.failure(localId, error));
    return;
  }

  yield put(createList.success(localId, list));
}

export function* createListInCurrentBoardService(data) {
  const { boardId } = yield select(pathSelector);

  yield call(createListService, boardId, data);
}

export function* handleListCreateService(label) {
  yield put(handleListCreate(label));
}

export function* updateListService(id, data) {
  yield put(updateList(id, data));

  let list;
  try {
    ({ item: list } = yield call(request, api.updateList, id, data));
  } catch (error) {
    yield put(updateList.failure(id, error));
    return;
  }

  yield put(updateList.success(list));
}

export function* moveListService(id, index) {
  const { boardId } = yield select(listByIdSelector, id);
  const position = yield select(nextListPositionSelector, boardId, index, id);

  yield call(updateListService, id, {
    position,
  });
}

export function* handleListUpdateService(label) {
  yield put(handleListUpdate(label));
}

export function* deleteListService(id) {
  yield put(deleteList(id));

  let list;
  try {
    ({ item: list } = yield call(request, api.deleteList, id));
  } catch (error) {
    yield put(deleteList.failure(id, error));
    return;
  }

  yield put(deleteList.success(list));
}

export function* handleListDeleteService(label) {
  yield put(handleListDelete(label));
}
