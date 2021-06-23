import { call, put, select, take } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import request from '../request';
import {
  currentBoardSelector,
  isCoreInitializingSelector,
  notificationIdsForCurrentCardSelector,
  pathsMatchSelector,
} from '../../../selectors';
import { handleLocationChange } from '../../../actions';
import api from '../../../api';
import ActionTypes from '../../../constants/ActionTypes';
import Paths from '../../../constants/Paths';

export function* goToRootService() {
  yield put(push(Paths.ROOT));
}

export function* goToProjectService(projectId) {
  yield put(push(Paths.PROJECTS.replace(':id', projectId)));
}

export function* goToBoardService(boardId) {
  yield put(push(Paths.BOARDS.replace(':id', boardId)));
}

export function* goToCardService(cardId) {
  yield put(push(Paths.CARDS.replace(':id', cardId)));
}

export function* handleLocationChangeService() {
  const pathsMatch = yield select(pathsMatchSelector);

  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.path) {
    case Paths.LOGIN:
      yield call(goToRootService);

      break;
    default:
  }

  const isCoreInitializing = yield select(isCoreInitializingSelector);

  if (isCoreInitializing) {
    yield take(ActionTypes.CORE_INITIALIZE);
  }

  let board;
  let users;
  let projects;
  let boardMemberships;
  let labels;
  let lists;
  let cards;
  let cardMemberships;
  let cardLabels;
  let tasks;
  let attachments;
  let notifications;

  switch (pathsMatch.path) {
    case Paths.BOARDS:
    case Paths.CARDS: {
      const currentBoard = yield select(currentBoardSelector);

      if (currentBoard && currentBoard.isFetching === null) {
        yield put(handleLocationChange.fetchBoard(currentBoard.id));

        try {
          ({
            item: board,
            included: {
              users,
              projects,
              boardMemberships,
              labels,
              lists,
              cards,
              cardMemberships,
              cardLabels,
              tasks,
              attachments,
            },
          } = yield call(request, api.getBoard, currentBoard.id));
        } catch (error) {} // eslint-disable-line no-empty
      }

      if (pathsMatch.path === Paths.CARDS) {
        const notificationIds = yield select(notificationIdsForCurrentCardSelector);

        if (notificationIds && notificationIds.length > 0) {
          try {
            ({ items: notifications } = yield call(
              request,
              api.updateNotifications,
              notificationIds,
              {
                isRead: true,
              },
            ));
          } catch (error) {} // eslint-disable-line no-empty
        }
      }

      break;
    }
    default:
  }

  yield put(
    handleLocationChange(
      board,
      users,
      projects,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      tasks,
      attachments,
      notifications,
    ),
  );
}
