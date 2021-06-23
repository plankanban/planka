import { call, select } from 'redux-saga/effects';

import request from '../request';
import { pathsMatchSelector } from '../../../selectors';
import api from '../../../api';
import Paths from '../../../constants/Paths';

// eslint-disable-next-line import/prefer-default-export
export function* fetchBoardByCurrentPathRequest() {
  const pathsMatch = yield select(pathsMatchSelector);

  let board;
  let card;
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

  if (pathsMatch) {
    let boardId;
    if (pathsMatch.path === Paths.BOARDS) {
      boardId = pathsMatch.params.id;
    } else if (pathsMatch.path === Paths.CARDS) {
      ({
        item: card,
        item: { boardId },
      } = yield call(request, api.getCard, pathsMatch.params.id));
    }

    if (boardId) {
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
      } = yield call(request, api.getBoard, boardId));
    }
  }

  return {
    board,
    card,
    users,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
    project: projects[0],
  };
}
