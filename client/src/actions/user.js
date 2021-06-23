import ActionTypes from '../constants/ActionTypes';

export const createUser = (data) => ({
  type: ActionTypes.USER_CREATE,
  payload: {
    data,
  },
});

createUser.success = (user) => ({
  type: ActionTypes.USER_CREATE__SUCCESS,
  payload: {
    user,
  },
});

createUser.failure = (error) => ({
  type: ActionTypes.USER_CREATE__FAILURE,
  payload: {
    error,
  },
});

export const handleUserCreate = (user) => ({
  type: ActionTypes.USER_CREATE_HANDLE,
  payload: {
    user,
  },
});

export const clearUserCreateError = () => ({
  type: ActionTypes.USER_CREATE_ERROR_CLEAR,
  payload: {},
});

export const updateUser = (id, data) => ({
  type: ActionTypes.USER_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUser.success = (user) => ({
  type: ActionTypes.USER_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUser.failure = (id, error) => ({
  type: ActionTypes.USER_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleUserUpdate = (user, users, isCurrent) => ({
  type: ActionTypes.USER_UPDATE_HANDLE,
  payload: {
    user,
    users,
    isCurrent,
  },
});

export const updateUserEmail = (id, data) => ({
  type: ActionTypes.USER_EMAIL_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserEmail.success = (user) => ({
  type: ActionTypes.USER_EMAIL_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUserEmail.failure = (id, error) => ({
  type: ActionTypes.USER_EMAIL_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const clearUserEmailUpdateError = (id) => ({
  type: ActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

export const updateUserPassword = (id, data) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserPassword.success = (user) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUserPassword.failure = (id, error) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const clearUserPasswordUpdateError = (id) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

export const updateUserUsername = (id, data) => ({
  type: ActionTypes.USER_USERNAME_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserUsername.success = (user) => ({
  type: ActionTypes.USER_USERNAME_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUserUsername.failure = (id, error) => ({
  type: ActionTypes.USER_USERNAME_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const clearUserUsernameUpdateError = (id) => ({
  type: ActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

export const updateUserAvatar = (id) => ({
  type: ActionTypes.USER_AVATAR_UPDATE,
  payload: {
    id,
  },
});

updateUserAvatar.success = (user) => ({
  type: ActionTypes.USER_AVATAR_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUserAvatar.failure = (id, error) => ({
  type: ActionTypes.USER_AVATAR_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const deleteUser = (id) => ({
  type: ActionTypes.USER_DELETE,
  payload: {
    id,
  },
});

deleteUser.success = (user) => ({
  type: ActionTypes.USER_DELETE__SUCCESS,
  payload: {
    user,
  },
});

deleteUser.failure = (id, error) => ({
  type: ActionTypes.USER_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleUserDelete = (user) => ({
  type: ActionTypes.USER_DELETE_HANDLE,
  payload: {
    user,
  },
});

export const addUserToCard = (id, cardId, isCurrent) => ({
  type: ActionTypes.USER_TO_CARD_ADD,
  payload: {
    id,
    cardId,
    isCurrent,
  },
});

addUserToCard.success = (cardMembership) => ({
  type: ActionTypes.USER_TO_CARD_ADD__SUCCESS,
  payload: {
    cardMembership,
  },
});

addUserToCard.failure = (id, cardId, error) => ({
  type: ActionTypes.USER_TO_CARD_ADD__FAILURE,
  payload: {
    id,
    cardId,
    error,
  },
});

export const handleUserToCardAdd = (cardMembership) => ({
  type: ActionTypes.USER_TO_CARD_ADD_HANDLE,
  payload: {
    cardMembership,
  },
});

export const removeUserFromCard = (id, cardId) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE,
  payload: {
    id,
    cardId,
  },
});

removeUserFromCard.success = (cardMembership) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE__SUCCESS,
  payload: {
    cardMembership,
  },
});

removeUserFromCard.failure = (id, cardId, error) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE__FAILURE,
  payload: {
    id,
    cardId,
    error,
  },
});

export const handleUserFromCardRemove = (cardMembership) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardMembership,
  },
});

export const addUserToBoardFilter = (id, boardId) => ({
  type: ActionTypes.USER_TO_BOARD_FILTER_ADD,
  payload: {
    id,
    boardId,
  },
});

export const removeUserFromBoardFilter = (id, boardId) => ({
  type: ActionTypes.USER_FROM_BOARD_FILTER_REMOVE,
  payload: {
    id,
    boardId,
  },
});
