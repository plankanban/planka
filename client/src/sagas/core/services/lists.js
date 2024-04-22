import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createList(boardId, data) {
  const nextData = {
    ...data,
    position: yield select(selectors.selectNextListPosition, boardId),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createList({
      ...nextData,
      boardId,
      id: localId,
    }),
  );

  let list;
  try {
    ({ item: list } = yield call(request, api.createList, boardId, nextData));
  } catch (error) {
    yield put(actions.createList.failure(localId, error));
    return;
  }

  yield put(actions.createList.success(localId, list));
}

export function* createListInCurrentBoard(data) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(createList, boardId, data);
}

export function* handleListCreate(list) {
  yield put(actions.handleListCreate(list));
}

export function* updateList(id, data) {
  yield put(actions.updateList(id, data));

  let list;
  try {
    ({ item: list } = yield call(request, api.updateList, id, data));
  } catch (error) {
    yield put(actions.updateList.failure(id, error));
    return;
  }

  yield put(actions.updateList.success(list));
}

export function* handleListUpdate(list) {
  yield put(actions.handleListUpdate(list));
}

export function* moveList(id, index) {
  const { boardId } = yield select(selectors.selectListById, id);
  const position = yield select(selectors.selectNextListPosition, boardId, index, id);

  yield call(updateList, id, {
    position,
  });
}

// TODO: sort locally
export function* sortList(id, data) {
  yield put(actions.sortList(id, data));

  let list;
  let cards;

  try {
    ({
      item: list,
      included: { cards },
    } = yield call(request, api.sortList, id, data));
  } catch (error) {
    yield put(actions.sortList.failure(id, error));
    return;
  }

  yield put(actions.sortList.success(list, cards));
}

export function* handleListSort(list, cards) {
  yield put(actions.handleListSort(list, cards));
}

export function* deleteList(id) {
  yield put(actions.deleteList(id));

  let list;
  try {
    ({ item: list } = yield call(request, api.deleteList, id));
  } catch (error) {
    yield put(actions.deleteList.failure(id, error));
    return;
  }

  yield put(actions.deleteList.success(list));
}

export function* handleListDelete(list) {
  yield put(actions.handleListDelete(list));
}

export default {
  createList,
  createListInCurrentBoard,
  handleListCreate,
  updateList,
  handleListUpdate,
  moveList,
  sortList,
  handleListSort,
  deleteList,
  handleListDelete,
};
