import { call, put, select } from 'redux-saga/effects';

import { goToBoardService, goToProjectService, goToRootService } from './router';
import { logoutService } from './login';
import { closeModalService } from './modal';
import { deleteNotificationsRequest, fetchUsersRequest } from '../requests';
import {
  currentModalSelector,
  currentUserIdSelector,
  currentUserSelector,
  isAttachmentWithIdExistsSelector,
  pathSelector,
} from '../../../selectors';
import {
  createActionReceived,
  createAttachmentReceived,
  createBoardReceived,
  createCardLabelReceived,
  createCardMembershipReceived,
  createCardReceived,
  createLabelReceived,
  createListReceived,
  createNotificationReceived,
  createProjectMembershipReceived,
  createProjectReceived,
  createTaskReceived,
  createUserReceived,
  deleteActionReceived,
  deleteAttachmentReceived,
  deleteCardLabelReceived,
  deleteCardMembershipReceived,
  deleteCardReceived,
  deleteBoardReceived,
  deleteLabelReceived,
  deleteListReceived,
  deleteNotificationReceived,
  deleteProjectMembershipReceived,
  deleteProjectReceived,
  deleteTaskReceived,
  deleteUserReceived,
  socketDisconnected,
  socketReconnected,
  updateActionReceived,
  updateAttachmentReceived,
  updateBoardReceived,
  updateCardReceived,
  updateLabelReceived,
  updateListReceived,
  updateProjectReceived,
  updateTaskReceived,
  updateUserReceived,
} from '../../../actions';
import ModalTypes from '../../../constants/ModalTypes';

export function* socketDisconnectedService() {
  yield put(socketDisconnected());
}

// TODO: refetch state on reconnect
export function* socketReconnectedService() {
  yield put(socketReconnected());
}

export function* createUserReceivedService(user) {
  yield put(createUserReceived(user));
}

export function* updateUserReceivedService(user) {
  const currentUser = yield select(currentUserSelector);

  if (user.id === currentUser.id) {
    if (currentUser.isAdmin) {
      if (!user.isAdmin) {
        const currentModal = yield select(currentModalSelector);

        if (currentModal === ModalTypes.USERS) {
          yield call(closeModalService);
        }
      }
    } else if (user.isAdmin) {
      yield call(fetchUsersRequest);
    }
  }

  yield put(updateUserReceived(user));
}

export function* deleteUserReceivedService(user) {
  const currentUserId = yield select(currentUserIdSelector);

  if (user.id === currentUserId) {
    yield call(logoutService);
  }

  yield put(deleteUserReceived(user));
}

export function* createProjectReceivedService(project, users, projectMemberships, boards) {
  yield put(createProjectReceived(project, users, projectMemberships, boards));
}

export function* updateProjectReceivedService(project) {
  yield put(updateProjectReceived(project));
}

export function* deleteProjectReceivedService(project) {
  const { projectId } = yield select(pathSelector);

  if (project.id === projectId) {
    yield call(goToRootService);
  }

  yield put(deleteProjectReceived(project));
}

export function* createProjectMembershipReceivedService(projectMembership, user) {
  yield put(createProjectMembershipReceived(projectMembership, user));
}

export function* deleteProjectMembershipReceivedService(projectMembership) {
  yield put(deleteProjectMembershipReceived(projectMembership));
}

export function* createBoardReceivedService(board, lists, labels) {
  yield put(createBoardReceived(board, lists, labels));
}

export function* updateBoardReceivedService(board) {
  yield put(updateBoardReceived(board));
}

export function* deleteBoardReceivedService(board) {
  const { boardId, projectId } = yield select(pathSelector);

  if (board.id === boardId) {
    yield call(goToProjectService, projectId);
  }

  yield put(deleteBoardReceived(board));
}

export function* createListReceivedService(list) {
  yield put(createListReceived(list));
}

export function* updateListReceivedService(list) {
  yield put(updateListReceived(list));
}

export function* deleteListReceivedService(list) {
  yield put(deleteListReceived(list));
}

export function* createLabelReceivedService(label) {
  yield put(createLabelReceived(label));
}

export function* updateLabelReceivedService(label) {
  yield put(updateLabelReceived(label));
}

export function* deleteLabelReceivedService(label) {
  yield put(deleteLabelReceived(label));
}

export function* createCardReceivedService(card) {
  yield put(createCardReceived(card));
}

export function* updateCardReceivedService(card) {
  yield put(updateCardReceived(card));
}

export function* deleteCardReceivedService(card) {
  const { cardId, boardId } = yield select(pathSelector);

  if (card.id === cardId) {
    yield call(goToBoardService, boardId);
  }

  yield put(deleteCardReceived(card));
}

export function* createCardMembershipReceivedService(cardMembership) {
  yield put(createCardMembershipReceived(cardMembership));
}

export function* deleteCardMembershipReceivedService(cardMembership) {
  yield put(deleteCardMembershipReceived(cardMembership));
}

export function* createCardLabelReceivedService(cardLabel) {
  yield put(createCardLabelReceived(cardLabel));
}

export function* deleteCardLabelReceivedService(cardLabel) {
  yield put(deleteCardLabelReceived(cardLabel));
}

export function* createTaskReceivedService(task) {
  yield put(createTaskReceived(task));
}

export function* updateTaskReceivedService(task) {
  yield put(updateTaskReceived(task));
}

export function* deleteTaskReceivedService(task) {
  yield put(deleteTaskReceived(task));
}

export function* createAttachmentReceivedService(attachment, requestId) {
  const isExists = yield select(isAttachmentWithIdExistsSelector, requestId);

  if (!isExists) {
    yield put(createAttachmentReceived(attachment));
  }
}

export function* updateAttachmentReceivedService(attachment) {
  yield put(updateAttachmentReceived(attachment));
}

export function* deleteAttachmentReceivedService(attachment) {
  yield put(deleteAttachmentReceived(attachment));
}

export function* createActionReceivedService(action) {
  yield put(createActionReceived(action));
}

export function* updateActionReceivedService(action) {
  yield put(updateActionReceived(action));
}

export function* deleteActionReceivedService(action) {
  yield put(deleteActionReceived(action));
}

export function* createNotificationReceivedService(notification, user, card, action) {
  const { cardId } = yield select(pathSelector);

  if (card.id === cardId) {
    yield call(deleteNotificationsRequest, [notification.id]);
  } else {
    yield put(createNotificationReceived(notification, user, card, action));
  }
}

export function* deleteNotificationReceivedService(notification) {
  yield put(deleteNotificationReceived(notification));
}
