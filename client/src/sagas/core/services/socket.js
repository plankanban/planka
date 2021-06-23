import { call, put, select } from 'redux-saga/effects';

import { fetchCoreRequest } from '../requests';
import { currentUserIdSelector, pathSelector } from '../../../selectors';
import { handleSocketDisconnect, handleSocketReconnect } from '../../../actions';

export function* handleSocketDisconnectService() {
  yield put(handleSocketDisconnect());
}

export function* handleSocketReconnectService() {
  const currentUserId = yield select(currentUserIdSelector);
  const { boardId } = yield select(pathSelector);

  yield put(handleSocketReconnect.fetchCore(currentUserId, boardId));

  const {
    user,
    board,
    users,
    projects,
    projectManagers,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
    actions,
    notifications,
  } = yield call(fetchCoreRequest); // TODO: handle error

  yield put(
    handleSocketReconnect(
      user,
      board,
      users,
      projects,
      projectManagers,
      boards,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      tasks,
      attachments,
      actions,
      notifications,
    ),
  );
}
