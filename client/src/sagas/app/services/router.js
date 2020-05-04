import { call, put, select } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import { deleteNotificationsInCurrentCardService } from './notifications';
import { fetchBoardRequest } from '../requests';
import {
  currentBoardSelector,
  isAppInitializingSelector,
  pathsMatchSelector,
} from '../../../selectors';
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

export function* runPathActionsService(pathsMatch) {
  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.path) {
    case Paths.BOARDS:
    case Paths.CARDS: {
      const currentBoard = yield select(currentBoardSelector); // TODO: move to services

      if (currentBoard && currentBoard.isFetching === null) {
        yield call(fetchBoardRequest, currentBoard.id);
      }

      if (pathsMatch.path === Paths.CARDS) {
        yield call(deleteNotificationsInCurrentCardService);
      }

      break;
    }
    default:
  }
}

export function* locationChangedService() {
  const pathsMatch = yield select(pathsMatchSelector);

  if (pathsMatch) {
    switch (pathsMatch.path) {
      case Paths.LOGIN:
        yield call(goToRootService);

        break;
      default:
    }
  }

  const isAppInitializing = yield select(isAppInitializingSelector);

  if (!isAppInitializing) {
    yield call(runPathActionsService, pathsMatch);
  }
}
