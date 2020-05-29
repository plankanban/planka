import { call, put, select } from 'redux-saga/effects';

import {
  createCardMembershipRequest,
  createUserRequest,
  deleteCardMembershipRequest,
  deleteUserRequest,
  updateUserAvatarRequest,
  updateUserEmailRequest,
  updateUserPasswordRequest,
  updateUserRequest,
  updateUserUsernameRequest,
} from '../requests';
import { currentUserIdSelector, pathSelector } from '../../../selectors';
import {
  addUserToBoardFilter,
  addUserToCard,
  clearUserCreateError,
  clearUserEmailUpdateError,
  clearUserPasswordUpdateError,
  clearUserUsernameUpdateError,
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

export function* clearUserCreateErrorService() {
  yield put(clearUserCreateError());
}

export function* updateUserService(id, data) {
  yield put(updateUser(id, data));
  yield call(updateUserRequest, id, data);
}

export function* updateCurrentUserService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserService, id, data);
}

export function* updateUserEmailService(id, data) {
  yield call(updateUserEmailRequest, id, data);
}

export function* updateCurrentUserEmailService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserEmailService, id, data);
}

export function* clearUserEmailUpdateErrorService(id) {
  yield put(clearUserEmailUpdateError(id));
}

export function* clearCurrentUserEmailUpdateErrorService() {
  const id = yield select(currentUserIdSelector);

  yield call(clearUserEmailUpdateErrorService, id);
}

export function* updateUserPasswordService(id, data) {
  yield call(updateUserPasswordRequest, id, data);
}

export function* updateCurrentUserPasswordService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserPasswordService, id, data);
}

export function* clearUserPasswordUpdateErrorService(id) {
  yield put(clearUserPasswordUpdateError(id));
}

export function* clearCurrentUserPasswordUpdateErrorService() {
  const id = yield select(currentUserIdSelector);

  yield call(clearUserPasswordUpdateErrorService, id);
}

export function* updateUserUsernameService(id, data) {
  yield call(updateUserUsernameRequest, id, data);
}

export function* updateCurrentUserUsernameService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserUsernameService, id, data);
}

export function* clearUserUsernameUpdateErrorService(id) {
  yield put(clearUserUsernameUpdateError(id));
}

export function* clearCurrentUserUsernameUpdateErrorService() {
  const id = yield select(currentUserIdSelector);

  yield call(clearUserUsernameUpdateErrorService, id);
}

export function* updateUserAvatarService(id, data) {
  yield call(updateUserAvatarRequest, id, data);
}

export function* updateCurrentUserAvatarService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserAvatarService, id, data);
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
