/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createUser = (data) => ({
  type: EntryActionTypes.USER_CREATE,
  payload: {
    data,
  },
});

const handleUserCreate = (user) => ({
  type: EntryActionTypes.USER_CREATE_HANDLE,
  payload: {
    user,
  },
});

const clearUserCreateError = () => ({
  type: EntryActionTypes.USER_CREATE_ERROR_CLEAR,
  payload: {},
});

const updateUser = (id, data) => ({
  type: EntryActionTypes.USER_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentUser = (data) => ({
  type: EntryActionTypes.CURRENT_USER_UPDATE,
  payload: {
    data,
  },
});

const handleUserUpdate = (user) => ({
  type: EntryActionTypes.USER_UPDATE_HANDLE,
  payload: {
    user,
  },
});

const updateCurrentUserLanguage = (language) => ({
  type: EntryActionTypes.CURRENT_USER_LANGUAGE_UPDATE,
  payload: {
    language,
  },
});

const updateUserEmail = (id, data) => ({
  type: EntryActionTypes.USER_EMAIL_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentUserEmail = (data) => ({
  type: EntryActionTypes.CURRENT_USER_EMAIL_UPDATE,
  payload: {
    data,
  },
});

const clearUserEmailUpdateError = (id) => ({
  type: EntryActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const clearCurrentUserEmailUpdateError = () => ({
  type: EntryActionTypes.CURRENT_USER_EMAIL_UPDATE_ERROR_CLEAR,
  payload: {},
});

const updateUserPassword = (id, data) => ({
  type: EntryActionTypes.USER_PASSWORD_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentUserPassword = (data) => ({
  type: EntryActionTypes.CURRENT_USER_PASSWORD_UPDATE,
  payload: {
    data,
  },
});

const clearUserPasswordUpdateError = (id) => ({
  type: EntryActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const clearCurrentUserPasswordUpdateError = () => ({
  type: EntryActionTypes.CURRENT_USER_PASSWORD_UPDATE_ERROR_CLEAR,
  payload: {},
});

const updateUserUsername = (id, data) => ({
  type: EntryActionTypes.USER_USERNAME_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentUserUsername = (data) => ({
  type: EntryActionTypes.CURRENT_USER_USERNAME_UPDATE,
  payload: {
    data,
  },
});

const clearUserUsernameUpdateError = (id) => ({
  type: EntryActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const clearCurrentUserUsernameUpdateError = () => ({
  type: EntryActionTypes.CURRENT_USER_USERNAME_UPDATE_ERROR_CLEAR,
  payload: {},
});

const updateCurrentUserAvatar = (data) => ({
  type: EntryActionTypes.CURRENT_USER_AVATAR_UPDATE,
  payload: {
    data,
  },
});

const createUserApiKey = (id) => ({
  type: EntryActionTypes.USER_API_KEY_CREATE,
  payload: {
    id,
  },
});

const deleteUserApiKey = (id) => ({
  type: EntryActionTypes.USER_API_KEY_DELETE,
  payload: {
    id,
  },
});

const clearUserApiKeyValue = (id) => ({
  type: EntryActionTypes.USER_API_KEY_VALUE_CLEAR,
  payload: {
    id,
  },
});

const deleteUser = (id) => ({
  type: EntryActionTypes.USER_DELETE,
  payload: {
    id,
  },
});

const handleUserDelete = (user) => ({
  type: EntryActionTypes.USER_DELETE_HANDLE,
  payload: {
    user,
  },
});

const addUserToCard = (id, cardId) => ({
  type: EntryActionTypes.USER_TO_CARD_ADD,
  payload: {
    id,
    cardId,
  },
});

const addUserToCurrentCard = (id) => ({
  type: EntryActionTypes.USER_TO_CURRENT_CARD_ADD,
  payload: {
    id,
  },
});

const addCurrentUserToCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_USER_TO_CURRENT_CARD_ADD,
  payload: {},
});

const handleUserToCardAdd = (cardMembership) => ({
  type: EntryActionTypes.USER_TO_CARD_ADD_HANDLE,
  payload: {
    cardMembership,
  },
});

const removeUserFromCard = (id, cardId) => ({
  type: EntryActionTypes.USER_FROM_CARD_REMOVE,
  payload: {
    id,
    cardId,
  },
});

const removeUserFromCurrentCard = (id) => ({
  type: EntryActionTypes.USER_FROM_CURRENT_CARD_REMOVE,
  payload: {
    id,
  },
});

const removeCurrentUserFromCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_USER_FROM_CURRENT_CARD_REMOVE,
  payload: {},
});

const handleUserFromCardRemove = (cardMembership) => ({
  type: EntryActionTypes.USER_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardMembership,
  },
});

const addUserToFilterInCurrentBoard = (id, replace = false) => ({
  type: EntryActionTypes.USER_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
    replace,
  },
});

const removeUserFromFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.USER_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
  payload: {
    id,
  },
});

export default {
  createUser,
  handleUserCreate,
  clearUserCreateError,
  updateUser,
  updateCurrentUser,
  handleUserUpdate,
  updateCurrentUserLanguage,
  updateUserEmail,
  updateCurrentUserEmail,
  clearUserEmailUpdateError,
  clearCurrentUserEmailUpdateError,
  updateUserPassword,
  updateCurrentUserPassword,
  clearUserPasswordUpdateError,
  clearCurrentUserPasswordUpdateError,
  updateUserUsername,
  updateCurrentUserUsername,
  clearUserUsernameUpdateError,
  clearCurrentUserUsernameUpdateError,
  updateCurrentUserAvatar,
  createUserApiKey,
  deleteUserApiKey,
  clearUserApiKeyValue,
  deleteUser,
  handleUserDelete,
  addUserToCard,
  addUserToCurrentCard,
  addCurrentUserToCurrentCard,
  handleUserToCardAdd,
  removeUserFromCard,
  removeUserFromCurrentCard,
  removeCurrentUserFromCurrentCard,
  handleUserFromCardRemove,
  addUserToFilterInCurrentBoard,
  removeUserFromFilterInCurrentBoard,
};
