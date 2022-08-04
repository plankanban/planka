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

const handleUserFromCardRemove = (cardMembership) => ({
  type: EntryActionTypes.USER_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardMembership,
  },
});

const addUserToFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.USER_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
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
  deleteUser,
  handleUserDelete,
  addUserToCard,
  addUserToCurrentCard,
  handleUserToCardAdd,
  removeUserFromCard,
  removeUserFromCurrentCard,
  handleUserFromCardRemove,
  addUserToFilterInCurrentBoard,
  removeUserFromFilterInCurrentBoard,
};
