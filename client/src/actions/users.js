/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleUsersReset = (users) => ({
  type: ActionTypes.USERS_RESET_HANDLE,
  payload: {
    users,
  },
});

const createUser = (data) => ({
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

const handleUserCreate = (user) => ({
  type: ActionTypes.USER_CREATE_HANDLE,
  payload: {
    user,
  },
});

const clearUserCreateError = () => ({
  type: ActionTypes.USER_CREATE_ERROR_CLEAR,
  payload: {},
});

const updateUser = (id, data) => ({
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

const handleUserUpdate = (
  user,
  projectIds,
  boardIds,
  bootstrap,
  config,
  board,
  webhooks,
  users,
  projects,
  projectManagers,
  backgroundImages,
  baseCustomFieldGroups,
  boards,
  boardMemberships,
  labels,
  lists,
  cards,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
  notificationsToDelete,
  notificationServices,
) => ({
  type: ActionTypes.USER_UPDATE_HANDLE,
  payload: {
    user,
    projectIds,
    boardIds,
    bootstrap,
    config,
    board,
    webhooks,
    users,
    projects,
    projectManagers,
    backgroundImages,
    baseCustomFieldGroups,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
    notificationsToDelete,
    notificationServices,
  },
});

const updateUserEmail = (id, data) => ({
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

const clearUserEmailUpdateError = (id) => ({
  type: ActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const updateUserPassword = (id, data) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserPassword.success = (user, accessToken) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE__SUCCESS,
  payload: {
    user,
    accessToken,
  },
});

updateUserPassword.failure = (id, error) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearUserPasswordUpdateError = (id) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const updateUserUsername = (id, data) => ({
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

const clearUserUsernameUpdateError = (id) => ({
  type: ActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const updateUserAvatar = (id) => ({
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

const createUserApiKey = (id) => ({
  type: ActionTypes.USER_API_KEY_CREATE,
  payload: {
    id,
  },
});

createUserApiKey.success = (user, apiKey) => ({
  type: ActionTypes.USER_API_KEY_CREATE__SUCCESS,
  payload: {
    user,
    apiKey,
  },
});

createUserApiKey.failure = (id, error) => ({
  type: ActionTypes.USER_API_KEY_CREATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteUserApiKey = (id) => ({
  type: ActionTypes.USER_API_KEY_DELETE,
  payload: {
    id,
  },
});

deleteUserApiKey.success = (user) => ({
  type: ActionTypes.USER_API_KEY_DELETE__SUCCESS,
  payload: {
    user,
  },
});

deleteUserApiKey.failure = (id, error) => ({
  type: ActionTypes.USER_API_KEY_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearUserApiKeyValue = (id) => ({
  type: ActionTypes.USER_API_KEY_VALUE_CLEAR,
  payload: {
    id,
  },
});

const setupUserTotp = (id) => ({
  type: ActionTypes.USER_TOTP_SETUP,
  payload: {
    id,
  },
});

setupUserTotp.success = (id, setup) => ({
  type: ActionTypes.USER_TOTP_SETUP__SUCCESS,
  payload: {
    id,
    setup,
  },
});

setupUserTotp.failure = (id, error) => ({
  type: ActionTypes.USER_TOTP_SETUP__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearUserTotpSetupValue = (id) => ({
  type: ActionTypes.USER_TOTP_SETUP_VALUE_CLEAR,
  payload: {
    id,
  },
});

const enableUserTotp = (id) => ({
  type: ActionTypes.USER_TOTP_ENABLE,
  payload: {
    id,
  },
});

enableUserTotp.success = (user, recoveryCodes) => ({
  type: ActionTypes.USER_TOTP_ENABLE__SUCCESS,
  payload: {
    user,
    recoveryCodes,
  },
});

enableUserTotp.failure = (id, error) => ({
  type: ActionTypes.USER_TOTP_ENABLE__FAILURE,
  payload: {
    id,
    error,
  },
});

const disableUserTotp = (id) => ({
  type: ActionTypes.USER_TOTP_DISABLE,
  payload: {
    id,
  },
});

disableUserTotp.success = (user) => ({
  type: ActionTypes.USER_TOTP_DISABLE__SUCCESS,
  payload: {
    user,
  },
});

disableUserTotp.failure = (id, error) => ({
  type: ActionTypes.USER_TOTP_DISABLE__FAILURE,
  payload: {
    id,
    error,
  },
});

const regenerateUserTotpRecoveryCodes = (id) => ({
  type: ActionTypes.USER_TOTP_RECOVERY_CODES_REGENERATE,
  payload: {
    id,
  },
});

regenerateUserTotpRecoveryCodes.success = (id, recoveryCodes) => ({
  type: ActionTypes.USER_TOTP_RECOVERY_CODES_REGENERATE__SUCCESS,
  payload: {
    id,
    recoveryCodes,
  },
});

regenerateUserTotpRecoveryCodes.failure = (id, error) => ({
  type: ActionTypes.USER_TOTP_RECOVERY_CODES_REGENERATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearUserTotpRecoveryCodes = (id) => ({
  type: ActionTypes.USER_TOTP_RECOVERY_CODES_CLEAR,
  payload: {
    id,
  },
});

const fetchUserTrustedDevices = (id) => ({
  type: ActionTypes.USER_TRUSTED_DEVICES_FETCH,
  payload: {
    id,
  },
});

fetchUserTrustedDevices.success = (id, devices) => ({
  type: ActionTypes.USER_TRUSTED_DEVICES_FETCH__SUCCESS,
  payload: {
    id,
    devices,
  },
});

fetchUserTrustedDevices.failure = (id, error) => ({
  type: ActionTypes.USER_TRUSTED_DEVICES_FETCH__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteUserTrustedDevice = (id, deviceId) => ({
  type: ActionTypes.USER_TRUSTED_DEVICE_DELETE,
  payload: {
    id,
    deviceId,
  },
});

deleteUserTrustedDevice.success = (id, device) => ({
  type: ActionTypes.USER_TRUSTED_DEVICE_DELETE__SUCCESS,
  payload: {
    id,
    device,
  },
});

deleteUserTrustedDevice.failure = (id, deviceId, error) => ({
  type: ActionTypes.USER_TRUSTED_DEVICE_DELETE__FAILURE,
  payload: {
    id,
    deviceId,
    error,
  },
});

const deleteUser = (id) => ({
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

const handleUserDelete = (user) => ({
  type: ActionTypes.USER_DELETE_HANDLE,
  payload: {
    user,
  },
});

const addUserToCard = (id, cardId, isCurrent) => ({
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

const handleUserToCardAdd = (cardMembership) => ({
  type: ActionTypes.USER_TO_CARD_ADD_HANDLE,
  payload: {
    cardMembership,
  },
});

const removeUserFromCard = (id, cardId) => ({
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

const handleUserFromCardRemove = (cardMembership) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardMembership,
  },
});

const addUserToBoardFilter = (id, boardId, replace, currentListId) => ({
  type: ActionTypes.USER_TO_BOARD_FILTER_ADD,
  payload: {
    id,
    boardId,
    replace,
    currentListId,
  },
});

const removeUserFromBoardFilter = (id, boardId, currentListId) => ({
  type: ActionTypes.USER_FROM_BOARD_FILTER_REMOVE,
  payload: {
    id,
    boardId,
    currentListId,
  },
});

export default {
  handleUsersReset,
  createUser,
  handleUserCreate,
  clearUserCreateError,
  updateUser,
  handleUserUpdate,
  updateUserEmail,
  clearUserEmailUpdateError,
  updateUserPassword,
  clearUserPasswordUpdateError,
  updateUserUsername,
  clearUserUsernameUpdateError,
  updateUserAvatar,
  createUserApiKey,
  deleteUserApiKey,
  clearUserApiKeyValue,
  setupUserTotp,
  clearUserTotpSetupValue,
  enableUserTotp,
  disableUserTotp,
  regenerateUserTotpRecoveryCodes,
  clearUserTotpRecoveryCodes,
  fetchUserTrustedDevices,
  deleteUserTrustedDevice,
  deleteUser,
  handleUserDelete,
  addUserToCard,
  handleUserToCardAdd,
  removeUserFromCard,
  handleUserFromCardRemove,
  addUserToBoardFilter,
  removeUserFromBoardFilter,
};
