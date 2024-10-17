import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* usersWatchers() {
  yield all([
    takeEvery(EntryActionTypes.USER_CREATE, ({ payload: { data } }) => services.createUser(data)),
    takeEvery(EntryActionTypes.USER_CREATE_HANDLE, ({ payload: { user } }) =>
      services.handleUserCreate(user),
    ),
    takeEvery(EntryActionTypes.USER_CREATE_ERROR_CLEAR, () => services.clearUserCreateError()),
    takeEvery(EntryActionTypes.USER_UPDATE, ({ payload: { id, data } }) =>
      services.updateUser(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentUser(data),
    ),
    takeEvery(EntryActionTypes.USER_UPDATE_HANDLE, ({ payload: { user } }) =>
      services.handleUserUpdate(user),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_LANGUAGE_UPDATE, ({ payload: { language } }) =>
      services.updateCurrentUserLanguage(language),
    ),
    takeEvery(EntryActionTypes.USER_EMAIL_UPDATE, ({ payload: { id, data } }) =>
      services.updateUserEmail(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_EMAIL_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentUserEmail(data),
    ),
    takeEvery(EntryActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR, ({ payload: { id } }) =>
      services.clearUserEmailUpdateError(id),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_EMAIL_UPDATE_ERROR_CLEAR, () =>
      services.clearCurrentUserEmailUpdateError(),
    ),
    takeEvery(EntryActionTypes.USER_PASSWORD_UPDATE, ({ payload: { id, data } }) =>
      services.updateUserPassword(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_PASSWORD_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentUserPassword(data),
    ),
    takeEvery(EntryActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR, ({ payload: { id } }) =>
      services.clearUserPasswordUpdateError(id),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_PASSWORD_UPDATE_ERROR_CLEAR, () =>
      services.clearCurrentUserPasswordUpdateError(),
    ),
    takeEvery(EntryActionTypes.USER_USERNAME_UPDATE, ({ payload: { id, data } }) =>
      services.updateUserUsername(id, data),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_USERNAME_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentUserUsername(data),
    ),
    takeEvery(EntryActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR, ({ payload: { id } }) =>
      services.clearUserUsernameUpdateError(id),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_USERNAME_UPDATE_ERROR_CLEAR, () =>
      services.clearCurrentUserUsernameUpdateError(),
    ),
    takeEvery(EntryActionTypes.CURRENT_USER_AVATAR_UPDATE, ({ payload: { data } }) =>
      services.updateCurrentUserAvatar(data),
    ),
    takeEvery(EntryActionTypes.USER_DELETE, ({ payload: { id } }) => services.deleteUser(id)),
    takeEvery(EntryActionTypes.USER_DELETE_HANDLE, ({ payload: { user } }) =>
      services.handleUserDelete(user),
    ),
    takeEvery(EntryActionTypes.USER_TO_CARD_ADD, ({ payload: { id, cardId } }) =>
      services.addUserToCard(id, cardId),
    ),
    takeEvery(EntryActionTypes.USER_TO_CURRENT_CARD_ADD, ({ payload: { id } }) =>
      services.addUserToCurrentCard(id),
    ),
    takeEvery(EntryActionTypes.USER_TO_CARD_ADD_HANDLE, ({ payload: { cardMembership } }) =>
      services.handleUserToCardAdd(cardMembership),
    ),
    takeEvery(EntryActionTypes.USER_FROM_CARD_REMOVE, ({ payload: { id, cardId } }) =>
      services.removeUserFromCard(id, cardId),
    ),
    takeEvery(EntryActionTypes.USER_FROM_CURRENT_CARD_REMOVE, ({ payload: { id } }) =>
      services.removeUserFromCurrentCard(id),
    ),
    takeEvery(EntryActionTypes.USER_FROM_CARD_REMOVE_HANDLE, ({ payload: { cardMembership } }) =>
      services.handleUserFromCardRemove(cardMembership),
    ),
    takeEvery(EntryActionTypes.USER_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) =>
      services.addUserToFilterInCurrentBoard(id),
    ),
    takeEvery(EntryActionTypes.USER_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) =>
      services.removeUserFromFilterInCurrentBoard(id),
    ),
  ]);
}
