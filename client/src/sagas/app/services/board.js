import { call, put, select } from 'redux-saga/effects';

import { goToBoardService, goToProjectService } from './router';
import { createBoardRequest, deleteBoardRequest, updateBoardRequest } from '../requests';
import { boardByIdSelector, nextBoardPositionSelector, pathSelector } from '../../../selectors';
import { createBoard, deleteBoard, updateBoard } from '../../../actions';
import { createLocalId } from '../../../utils/local-id';

export function* createBoardService(projectId, data) {
  const nextData = {
    ...data,
    position: yield select(nextBoardPositionSelector, projectId),
  };

  const localId = yield call(createLocalId);

  yield put(
    createBoard({
      ...nextData,
      projectId,
      id: localId,
    }),
  );

  const {
    success,
    payload: { board },
  } = yield call(createBoardRequest, projectId, localId, nextData);

  if (success) {
    yield call(goToBoardService, board.id);
  }
}

export function* createBoardInCurrentProjectService(data) {
  const { projectId } = yield select(pathSelector);

  yield call(createBoardService, projectId, data);
}

export function* updateBoardService(id, data) {
  yield put(updateBoard(id, data));
  yield call(updateBoardRequest, id, data);
}

export function* moveBoardService(id, index) {
  const { projectId } = yield select(boardByIdSelector, id);
  const position = yield select(nextBoardPositionSelector, projectId, index, id);

  yield call(updateBoardService, id, {
    position,
  });
}

export function* deleteBoardService(id) {
  const { boardId, projectId } = yield select(pathSelector);

  if (id === boardId) {
    yield call(goToProjectService, projectId);
  }

  yield put(deleteBoard(id));
  yield call(deleteBoardRequest, id);
}
