import { call, put, select } from 'redux-saga/effects';

import { createListRequest, deleteListRequest, updateListRequest } from '../requests';
import {
  listByIdSelector,
  maxIdSelector,
  nextListPositionSelector,
  pathSelector,
} from '../../../selectors';
import { createList, deleteList, updateList } from '../../../actions';
import { nextLocalId } from '../../../utils/local-id';
import { List } from '../../../models';

export function* createListService(boardId, data) {
  const nextData = {
    ...data,
    position: yield select(nextListPositionSelector, boardId),
  };

  const localId = nextLocalId(yield select(maxIdSelector, List.modelName));

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
