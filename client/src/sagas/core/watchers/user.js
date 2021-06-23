import { all, takeEvery } from 'redux-saga/effects';

import {
  addUserToCardService,
  addUserToCurrentCardService,
  addUserToFilterInCurrentBoardService,
  clearCurrentUserEmailUpdateErrorService,
  clearCurrentUserPasswordUpdateErrorService,
  clearCurrentUserUsernameUpdateErrorService,
  clearUserCreateErrorService,
  createUserService,
  deleteUserService,
  removeUserFromCardService,
  removeUserFromCurrentCardService,
  removeUserFromFilterInCurrentBoardService,
  updateUserService,
  updateCurrentUserAvatarService,
  updateCurrentUserEmailService,
  updateCurrentUserPasswordService,
  updateCurrentUserService,
  updateCurrentUserUsernameService,
  handleUserCreateService,
  handleUserUpdateService,
  handleUserDeleteService,
  handleUserToCardAddService,
  handleUserFromCardRemoveService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* userWatchers() {
  yield all([
    takeEvery(EntryActionTypes.USER_CREATE, ({ payload: { data } }) => createUserService(data)),
    takeEvery(EntryActionTypes.USER_CREATE_HANDLE, ({ payload: { user } }) =>
      handleUserCreateService(user),
    ),
    takeEvery(EntryActionTypes.USER_CREATE_ERROR_CLEAR, () => clearUserCreateErrorService()),
    takeEvery(EntryActionTypes.USER_UPDATE, ({ payload: { id, data } }) =>
      updateUserService(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_UPDATE, ({ payload: { data } }) =>
      updateCurrentUserService(data),
    ),
    takeEvery(EntryActionTypes.USER_UPDATE_HANDLE, ({ payload: { user } }) =>
      handleUserUpdateService(user),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_EMAIL_UPDATE, ({ payload: { data } }) =>
      updateCurrentUserEmailService(data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_EMAIL_UPDATE_ERROR_CLEAR, () =>
      clearCurrentUserEmailUpdateErrorService(),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_PASSWORD_UPDATE, ({ payload: { data } }) =>
      updateCurrentUserPasswordService(data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_PASSWORD_UPDATE_ERROR_CLEAR, () =>
      clearCurrentUserPasswordUpdateErrorService(),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_USERNAME_UPDATE, ({ payload: { data } }) =>
      updateCurrentUserUsernameService(data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_USERNAME_UPDATE_ERROR_CLEAR, () =>
      clearCurrentUserUsernameUpdateErrorService(),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_AVATAR_UPDATE, ({ payload: { data } }) =>
      updateCurrentUserAvatarService(data),
    ),
    takeEvery(EntryActionTypes.USER_DELETE, ({ payload: { id } }) => deleteUserService(id)),
    takeEvery(EntryActionTypes.USER_DELETE_HANDLE, ({ payload: { user } }) =>
      handleUserDeleteService(user),
    ),
    takeEvery(EntryActionTypes.USER_TO_CARD_ADD, ({ payload: { id, cardId } }) =>
      addUserToCardService(id, cardId),
    ),
    takeEvery(EntryActionTypes.USER_TO_CURRENT_CARD_ADD, ({ payload: { id } }) =>
      addUserToCurrentCardService(id),
    ),
    takeEvery(EntryActionTypes.USER_TO_CARD_ADD_HANDLE, ({ payload: { cardMembership } }) =>
      handleUserToCardAddService(cardMembership),
    ),
    takeEvery(EntryActionTypes.USER_FROM_CARD_REMOVE, ({ payload: { id, cardId } }) =>
      removeUserFromCardService(id, cardId),
    ),
    takeEvery(EntryActionTypes.USER_FROM_CURRENT_CARD_REMOVE, ({ payload: { id } }) =>
      removeUserFromCurrentCardService(id),
    ),
    takeEvery(EntryActionTypes.USER_FROM_CARD_REMOVE_HANDLE, ({ payload: { cardMembership } }) =>
      handleUserFromCardRemoveService(cardMembership),
    ),
    takeEvery(EntryActionTypes.USER_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) =>
      addUserToFilterInCurrentBoardService(id),
    ),
    takeEvery(EntryActionTypes.USER_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) =>
      removeUserFromFilterInCurrentBoardService(id),
    ),
  ]);
}
