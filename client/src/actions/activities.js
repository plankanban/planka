/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchActivities = (cardId) => ({
  type: ActionTypes.ACTIVITIES_FETCH,
  payload: {
    cardId,
  },
});

fetchActivities.success = (cardId, activities, users) => ({
  type: ActionTypes.ACTIVITIES_FETCH__SUCCESS,
  payload: {
    cardId,
    activities,
    users,
  },
});

fetchActivities.failure = (cardId, error) => ({
  type: ActionTypes.ACTIVITIES_FETCH__FAILURE,
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
  fetchActivities,
  handleActivityCreate,
};
