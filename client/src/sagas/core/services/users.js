/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import { changeCoreLanguage, logout } from './core';
import request from '../request';
import requests from '../requests';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { setAccessToken } from '../../../utils/access-token-storage';
import mergeRecords from '../../../utils/merge-records';
import { isUserAdminOrProjectOwner } from '../../../utils/record-helpers';
import { UserRoles } from '../../../constants/Enums';

export function* createUser(data) {
  yield put(actions.createUser(data));

  let user;
  try {
    ({ item: user } = yield call(request, api.createUser, data));
  } catch (error) {
    yield put(actions.createUser.failure(error));
    return;
  }

  yield put(actions.createUser.success(user));
}

export function* handleUserCreate(user) {
  yield put(actions.handleUserCreate(user));
}

export function* clearUserCreateError() {
  yield put(actions.clearUserCreateError());
}

export function* updateUser(id, data) {
  yield put(actions.updateUser(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUser, id, data));
  } catch (error) {
    yield put(actions.updateUser.failure(id, error));
    return;
  }

  yield put(actions.updateUser.success(user));
}

export function* updateCurrentUser(data) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(updateUser, currentUserId, data);
}

export function* handleUserUpdate(user) {
  const prevUser = yield select(selectors.selectUserById, user.id);

  const isChangedToAdminOrProjectOwner =
    (!prevUser || (prevUser.role !== user.role && prevUser.role !== UserRoles.ADMIN)) &&
    isUserAdminOrProjectOwner(user);

  const currentUser = yield select(selectors.selectCurrentUser);
  const isCurrentUser = user.id === currentUser.id;

  let bootstrap;
  let config;
  let board;
  let webhooks;
  let users1;
  let users2;
  let users3;
  let projects;
  let projectManagers;
  let backgroundImages;
  let baseCustomFieldGroups;
  let boards;
  let boardMemberships1;
  let boardMemberships2;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields1;
  let customFields2;
  let customFieldValues;
  let notificationsToDelete;
  let notificationServices;

  if (isCurrentUser && isChangedToAdminOrProjectOwner) {
    const { boardId } = yield select(selectors.selectPath);

    ({ items: users1 } = yield call(request, api.getUsers));

    if (user.role === UserRoles.ADMIN) {
      ({ item: bootstrap } = yield call(request, api.getBootstrap));
      ({ item: config } = yield call(request, api.getConfig));
      ({ items: webhooks } = yield call(request, api.getWebhooks));

      ({
        items: projects,
        included: {
          projectManagers,
          backgroundImages,
          baseCustomFieldGroups,
          boards,
          notificationServices,
          users: users2,
          boardMemberships: boardMemberships1,
          customFields: customFields1,
        },
      } = yield call(request, api.getProjects));

      if (boardId === null) {
        let body;
        try {
          body = yield call(requests.fetchBoardByCurrentPath);
        } catch {
          /* empty */
        }

        if (body) {
          ({
            board,
            labels,
            lists,
            cards,
            cardMemberships,
            cardLabels,
            taskLists,
            tasks,
            attachments,
            customFieldGroups,
            customFieldValues,
            users: users3,
            boardMemberships: boardMemberships2,
            customFields: customFields2,
          } = body);

          if (body.card) {
            notificationsToDelete = yield select(
              selectors.selectNotificationsByCardId,
              body.card.id,
            );
          }
        }
      }
    }
  }

  const projectIds = yield select(selectors.selectProjectIdsForCurrentUser);
  const boardIds = yield select(selectors.selectBoardIdsForCurrentUser);

  yield put(
    actions.handleUserUpdate(
      user,
      projectIds,
      boardIds,
      bootstrap,
      config,
      board,
      webhooks,
      mergeRecords(users1, users2, users3),
      projects,
      projectManagers,
      backgroundImages,
      baseCustomFieldGroups,
      boards,
      mergeRecords(boardMemberships1, boardMemberships2),
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      mergeRecords(customFields1, customFields2),
      customFieldValues,
      notificationsToDelete,
      notificationServices,
    ),
  );

  if (isCurrentUser) {
    const isAvailableForCurrentUser = yield select(selectors.isCurrentModalAvailableForCurrentUser);

    if (!isAvailableForCurrentUser) {
      yield put(actions.closeModal());
    }
  }
}

// TODO: add loading state
export function* updateUserLanguage(id, language) {
  yield call(changeCoreLanguage, language);

  yield call(updateUser, id, {
    language,
  });
}

export function* updateCurrentUserLanguage(language) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(updateUserLanguage, currentUserId, language);
}

export function* updateUserEmail(id, data) {
  yield put(actions.updateUserEmail(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserEmail, id, data));
  } catch (error) {
    yield put(actions.updateUserEmail.failure(id, error));
    return;
  }

  yield put(actions.updateUserEmail.success(user));
}

export function* updateCurrentUserEmail(data) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(updateUserEmail, currentUserId, data);
}

export function* clearUserEmailUpdateError(id) {
  yield put(actions.clearUserEmailUpdateError(id));
}

export function* clearCurrentUserEmailUpdateError() {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(clearUserEmailUpdateError, currentUserId);
}

export function* updateUserPassword(id, data) {
  yield put(actions.updateUserPassword(id, data));

  let user;
  let accessToken;

  try {
    ({ item: user, included: { accessToken } = {} } = yield call(
      request,
      api.updateUserPassword,
      id,
      data,
    ));
  } catch (error) {
    yield put(actions.updateUserPassword.failure(id, error));
    return;
  }

  if (accessToken) {
    yield call(setAccessToken, accessToken);
  }

  yield put(actions.updateUserPassword.success(user, accessToken));
}

export function* updateCurrentUserPassword(data) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(updateUserPassword, currentUserId, data);
}

export function* clearUserPasswordUpdateError(id) {
  yield put(actions.clearUserPasswordUpdateError(id));
}

export function* clearCurrentUserPasswordUpdateError() {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(clearUserPasswordUpdateError, currentUserId);
}

export function* updateUserUsername(id, data) {
  yield put(actions.updateUserUsername(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserUsername, id, data));
  } catch (error) {
    yield put(actions.updateUserUsername.failure(id, error));
    return;
  }

  yield put(actions.updateUserUsername.success(user));
}

export function* updateCurrentUserUsername(data) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(updateUserUsername, currentUserId, data);
}

export function* clearUserUsernameUpdateError(id) {
  yield put(actions.clearUserUsernameUpdateError(id));
}

export function* clearCurrentUserUsernameUpdateError() {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(clearUserUsernameUpdateError, currentUserId);
}

export function* updateUserAvatar(id, data) {
  yield put(actions.updateUserAvatar(id));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserAvatar, id, data));
  } catch (error) {
    yield put(actions.updateUserAvatar.failure(id, error));
    return;
  }

  yield put(actions.updateUserAvatar.success(user));
}

export function* updateCurrentUserAvatar(data) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(updateUserAvatar, currentUserId, data);
}

export function* deleteUser(id) {
  yield put(actions.deleteUser(id));

  let user;
  try {
    ({ item: user } = yield call(request, api.deleteUser, id));
  } catch (error) {
    yield put(actions.deleteUser.failure(id, error));
    return;
  }

  yield put(actions.deleteUser.success(user));
}

export function* handleUserDelete(user) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  if (user.id === currentUserId) {
    yield call(logout, false);
    return;
  }

  yield put(actions.handleUserDelete(user));
}

export function* addUserToCard(id, cardId) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield put(actions.addUserToCard(id, cardId, id === currentUserId));

  let cardMembership;
  try {
    ({ item: cardMembership } = yield call(request, api.createCardMembership, cardId, {
      userId: id,
    }));
  } catch (error) {
    yield put(actions.addUserToCard.failure(id, cardId, error));
    return;
  }

  yield put(actions.addUserToCard.success(cardMembership));
}

export function* addUserToCurrentCard(id) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(addUserToCard, id, cardId);
}

export function* addCurrentUserToCurrentCard() {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(addUserToCurrentCard, currentUserId);
}

export function* handleUserToCardAdd(cardMembership) {
  yield put(actions.handleUserToCardAdd(cardMembership));
}

export function* removeUserFromCard(id, cardId) {
  yield put(actions.removeUserFromCard(id, cardId));

  let cardMembership;
  try {
    ({ item: cardMembership } = yield call(request, api.deleteCardMembership, cardId, id));
  } catch (error) {
    yield put(actions.removeUserFromCard.failure(id, cardId, error));
    return;
  }

  yield put(actions.removeUserFromCard.success(cardMembership));
}

export function* removeUserFromCurrentCard(id) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(removeUserFromCard, id, cardId);
}

export function* removeCurrentUserFromCurrentCard() {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield call(removeUserFromCurrentCard, currentUserId);
}

export function* handleUserFromCardRemove(cardMembership) {
  yield put(actions.handleUserFromCardRemove(cardMembership));
}

export function* addUserToBoardFilter(id, boardId, replace) {
  const currentListId = yield select(selectors.selectCurrentListId);

  yield put(actions.addUserToBoardFilter(id, boardId, replace, currentListId));
}

export function* addUserToFilterInCurrentBoard(id, replace) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(addUserToBoardFilter, id, boardId, replace);
}

export function* removeUserFromBoardFilter(id, boardId) {
  const currentListId = yield select(selectors.selectCurrentListId);

  yield put(actions.removeUserFromBoardFilter(id, boardId, currentListId));
}

export function* removeUserFromFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(removeUserFromBoardFilter, id, boardId);
}

export default {
  createUser,
  handleUserCreate,
  clearUserCreateError,
  updateUser,
  updateCurrentUser,
  handleUserUpdate,
  updateUserLanguage,
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
  updateUserAvatar,
  updateCurrentUserAvatar,
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
  addUserToBoardFilter,
  addUserToFilterInCurrentBoard,
  removeUserFromBoardFilter,
  removeUserFromFilterInCurrentBoard,
};
