import { call, put, select } from 'redux-saga/effects';

import { logoutService } from './login';
import request from '../request';
import { currentUserIdSelector, currentUserSelector, pathSelector } from '../../../selectors';
import {
  addUserToBoardFilter,
  addUserToCard,
  clearUserCreateError,
  clearUserEmailUpdateError,
  clearUserPasswordUpdateError,
  clearUserUsernameUpdateError,
  createUser,
  deleteUser,
  handleUserCreate,
  handleUserDelete,
  handleUserFromCardRemove,
  handleUserToCardAdd,
  handleUserUpdate,
  removeUserFromBoardFilter,
  removeUserFromCard,
  updateUser,
  updateUserAvatar,
  updateUserEmail,
  updateUserPassword,
  updateUserUsername,
} from '../../../actions';
import api from '../../../api';

export function* createUserService(data) {
  yield put(createUser(data));

  let user;
  try {
    ({ item: user } = yield call(request, api.createUser, data));
  } catch (error) {
    yield put(createUser.failure(error));
    return;
  }

  yield put(createUser.success(user));
}

export function* handleUserCreateService(user) {
  yield put(handleUserCreate(user));
}

export function* clearUserCreateErrorService() {
  yield put(clearUserCreateError());
}

export function* updateUserService(id, data) {
  yield put(updateUser(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUser, id, data));
  } catch (error) {
    yield put(updateUser.failure(id, error));
    return;
  }

  yield put(updateUser.success(user));
}

export function* updateCurrentUserService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserService, id, data);
}

export function* handleUserUpdateService(user) {
  const currentUser = yield select(currentUserSelector);
  const isCurrent = user.id === currentUser.id;

  let users;
  if (isCurrent && !currentUser.isAdmin && user.isAdmin) {
    ({ items: users } = yield call(request, api.getUsers));
  }

  yield put(handleUserUpdate(user, users, isCurrent));
}

export function* updateUserEmailService(id, data) {
  yield put(updateUserEmail(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserEmail, id, data));
  } catch (error) {
    yield put(updateUserEmail.failure(id, error));
    return;
  }

  yield put(updateUserEmail.success(user));
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
  yield put(updateUserPassword(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserPassword, id, data));
  } catch (error) {
    yield put(updateUserPassword.failure(id, error));
    return;
  }

  yield put(updateUserPassword.success(user));
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
  yield put(updateUserUsername(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserUsername, id, data));
  } catch (error) {
    yield put(updateUserUsername.failure(id, error));
    return;
  }

  yield put(updateUserUsername.success(user));
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
  yield put(updateUserAvatar(id));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserAvatar, id, data));
  } catch (error) {
    yield put(updateUserAvatar.failure(id, error));
    return;
  }

  yield put(updateUserAvatar.success(user));
}

export function* updateCurrentUserAvatarService(data) {
  const id = yield select(currentUserIdSelector);

  yield call(updateUserAvatarService, id, data);
}

export function* deleteUserService(id) {
  yield put(deleteUser(id));

  let user;
  try {
    ({ item: user } = yield call(request, api.deleteUser, id));
  } catch (error) {
    yield put(deleteUser.failure(id, error));
    return;
  }

  yield put(deleteUser.success(user));
}

export function* handleUserDeleteService(user) {
  const currentUserId = yield select(currentUserIdSelector);

  if (user.id === currentUserId) {
    yield call(logoutService);
  }

  yield put(handleUserDelete(user));
}

export function* addUserToCardService(id, cardId) {
  const currentUserId = yield select(currentUserIdSelector);

  yield put(addUserToCard(id, cardId, id === currentUserId));

  let cardMembership;
  try {
    ({ item: cardMembership } = yield call(request, api.createCardMembership, cardId, {
      userId: id,
    }));
  } catch (error) {
    yield put(addUserToCard.failure(id, cardId, error));
    return;
  }

  yield put(addUserToCard.success(cardMembership));
}

export function* addUserToCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(addUserToCardService, id, cardId);
}

export function* handleUserToCardAddService(cardMembership) {
  yield put(handleUserToCardAdd(cardMembership));
}

export function* removeUserFromCardService(id, cardId) {
  yield put(removeUserFromCard(id, cardId));

  let cardMembership;
  try {
    ({ item: cardMembership } = yield call(request, api.deleteCardMembership, cardId, id));
  } catch (error) {
    yield put(removeUserFromCard.failure(id, cardId, error));
    return;
  }

  yield put(removeUserFromCard.success(cardMembership));
}

export function* removeUserFromCurrentCardService(id) {
  const { cardId } = yield select(pathSelector);

  yield call(removeUserFromCardService, id, cardId);
}

export function* handleUserFromCardRemoveService(cardMembership) {
  yield put(handleUserFromCardRemove(cardMembership));
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
