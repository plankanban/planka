import { call, put, select } from 'redux-saga/effects';

import { goToBoardService, goToProjectService } from './router';
import request from '../request';
import { boardByIdSelector, nextBoardPositionSelector, pathSelector } from '../../../selectors';
import {
  createBoard,
  deleteBoard,
  fetchBoard,
  handleBoardCreate,
  handleBoardDelete,
  handleBoardUpdate,
  updateBoard,
} from '../../../actions';
import api from '../../../api';
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

  let board;
  let boardMemberships;

  try {
    ({
      item: board,
      included: { boardMemberships },
    } = yield call(request, api.createBoard, projectId, nextData));
  } catch (error) {
    yield put(createBoard.failure(localId, error));
    return;
  }

  yield put(createBoard.success(localId, board, boardMemberships));
  yield call(goToBoardService, board.id);
}

export function* createBoardInCurrentProjectService(data) {
  const { projectId } = yield select(pathSelector);

  yield call(createBoardService, projectId, data);
}

export function* handleBoardCreateService(board) {
  yield put(handleBoardCreate(board));
}

export function* fetchBoardService(id) {
  yield put(fetchBoard(id));

  let board;
  let users;
  let projects;
  let boardMemberships;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let tasks;
  let attachments;

  try {
    ({
      item: board,
      included: {
        users,
        projects,
        boardMemberships,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        tasks,
        attachments,
      },
    } = yield call(request, api.getBoard, id));
  } catch (error) {
    yield put(fetchBoard.failure(id, error));
    return;
  }

  yield put(
    fetchBoard.success(
      board,
      users,
      projects,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      tasks,
      attachments,
    ),
  );
}

export function* updateBoardService(id, data) {
  yield put(updateBoard(id, data));

  let board;
  try {
    ({ item: board } = yield call(request, api.updateBoard, id, data));
  } catch (error) {
    yield put(updateBoard.failure(id, error));
    return;
  }

  yield put(updateBoard.success(board));
}

export function* handleBoardUpdateService(board) {
  yield put(handleBoardUpdate(board));
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

  let board;
  try {
    ({ item: board } = yield call(request, api.deleteBoard, id));
  } catch (error) {
    yield put(deleteBoard.failure(id, error));
    return;
  }

  yield put(deleteBoard.success(board));
}

export function* handleBoardDeleteService(board) {
  const { boardId, projectId } = yield select(pathSelector);

  if (board.id === boardId) {
    yield call(goToProjectService, projectId);
  }

  yield put(handleBoardDelete(board));
}
