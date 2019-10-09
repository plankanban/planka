import { call, put, select } from 'redux-saga/effects';

import { createListRequest, deleteListRequest, updateListRequest } from '../requests';
import { listByIdSelector, nextListPositionSelector, pathSelector } from '../../../selectors';
import { createList, deleteList, updateList } from '../../../actions';
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

  yield call(createListRequest, boardId, localId, nextData);
}

export function* createListInCurrentBoardService(data) {
  const { boardId } = yield select(pathSelector);

  yield call(createListService, boardId, data);
}

export function* updateListService(id, data) {
  yield put(updateList(id, data));
  yield call(updateListRequest, id, data);
}

export function* moveListService(id, index) {
  const { boardId } = yield select(listByIdSelector, id);
  const position = yield select(nextListPositionSelector, boardId, index, id);

  yield call(updateListService, id, {
    position,
  });
}

export function* deleteListService(id) {
  yield put(deleteList(id));
  yield call(deleteListRequest, id);
}
