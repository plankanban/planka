/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchActivitiesInBoard = (boardId) => ({
  type: ActionTypes.ACTIVITIES_IN_BOARD_FETCH,
  payload: {
    boardId,
  },
});

fetchActivitiesInBoard.success = (boardId, activities, users) => ({
  type: ActionTypes.ACTIVITIES_IN_BOARD_FETCH__SUCCESS,
  payload: {
    boardId,
    activities,
    users,
  },
});

fetchActivitiesInBoard.failure = (boardId, error) => ({
  type: ActionTypes.ACTIVITIES_IN_BOARD_FETCH__FAILURE,
  payload: {
    boardId,
    error,
  },
});

const fetchActivitiesInCard = (cardId) => ({
  type: ActionTypes.ACTIVITIES_IN_CARD_FETCH,
  payload: {
    cardId,
  },
});

fetchActivitiesInCard.success = (cardId, activities, users) => ({
  type: ActionTypes.ACTIVITIES_IN_CARD_FETCH__SUCCESS,
  payload: {
    cardId,
    activities,
    users,
  },
});

fetchActivitiesInCard.failure = (cardId, error) => ({
  type: ActionTypes.ACTIVITIES_IN_CARD_FETCH__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const handleActivityCreate = (activity) => ({
  type: ActionTypes.ACTIVITY_CREATE_HANDLE,
  payload: {
    activity,
  },
});

export default {
  fetchActivitiesInBoard,
  fetchActivitiesInCard,
  handleActivityCreate,
};
