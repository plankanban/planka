import { call, put, select } from 'redux-saga/effects';

import {
  createCardMembershipRequest,
  createUserRequest,
  deleteCardMembershipRequest,
  deleteUserRequest,
  updateUserRequest,
  uploadUserAvatarRequest,
} from '../requests';
import { currentUserIdSelector, pathSelector } from '../../../selectors';
import {
  addUserToBoardFilter,
  addUserToCard,
  clearUserCreationError,
  createUser,
  deleteUser,
  updateUser,
  removeUserFromBoardFilter,
  removeUserFromCard,
} from '../../../actions';

export function* createUserService(data) {
  yield put(createUser(data));
  yield call(createUserRequest, data);
}

export function* clearUserCreationErrorService() {
  yield put(clearUserCreationError());
}

export function* updateUserService(id, data) {
  yield put(updateUser(id, data));
  yield call(updateUserRequest, id, data);
}

export function* updateCurrentUserService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserService, id, data);
}

export function* uploadCurrentUserAvatarService(file) {
  const id = yield select(currentUserIdSelector);

  yield call(uploadUserAvatarRequest, id, file);
}

export function* deleteUserService(id) {
  yield put(deleteUser(id));
  yield call(deleteUserRequest, id);
}

export function* addUserToCardService(id, cardId) {
  const currentUserId = yield select(currentUserIdSelector);

  yield put(addUserToCard(id, cardId, id === currentUserId));
  yield call(createCardMembershipRequest, cardId, id);
}

export function* addUserToCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(addUserToCardService, id, cardId);
}

export function* removeUserFromCardService(id, cardId) {
  yield put(removeUserFromCard(id, cardId));
  yield call(deleteCardMembershipRequest, cardId, id);
}

export function* removeUserFromCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(removeUserFromCardService, id, cardId);
}

export function* addUserToBoardFilterService(id, boardId) {
  yield put(addUserToBoardFilter(id, boardId));
}

export function* addUserToFilterInCurrentBoardService(id) {
  const { boardId } = yield select(pathSelector);

  yield call(addUserToBoardFilterService, id, boardId);
}

export function* removeUserFromBoardFilterService(id, boardId) {
  yield put(removeUserFromBoardFilter(id, boardId));
}

export function* removeUserFromFilterInCurrentBoardService(id) {
  const { boardId } = yield select(pathSelector);

  yield call(removeUserFromBoardFilterService, id, boardId);
}
