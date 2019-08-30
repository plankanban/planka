import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createCommentAction = (action) => ({
  type: ActionTypes.COMMENT_ACTION_CREATE,
  payload: {
    action,
  },
});

export const updateCommentAction = (id, data) => ({
  type: ActionTypes.COMMENT_ACTION_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteCommentAction = (id) => ({
  type: ActionTypes.COMMENT_ACTION_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createCommentActionRequested = (localId, data) => ({
  type: ActionTypes.COMMENT_ACTION_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createCommentActionSucceeded = (localId, action) => ({
  type: ActionTypes.COMMENT_ACTION_CREATE_SUCCEEDED,
  payload: {
    localId,
    action,
  },
});

export const createCommentActionFailed = (localId, error) => ({
  type: ActionTypes.COMMENT_ACTION_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const updateCommentActionRequested = (id, data) => ({
  type: ActionTypes.COMMENT_ACTION_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateCommentActionSucceeded = (action) => ({
  type: ActionTypes.COMMENT_ACTION_UPDATE_SUCCEEDED,
  payload: {
    action,
  },
});

export const updateCommentActionFailed = (id, error) => ({
  type: ActionTypes.COMMENT_ACTION_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteCommentActionRequested = (id) => ({
  type: ActionTypes.COMMENT_ACTION_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteCommentActionSucceeded = (action) => ({
  type: ActionTypes.COMMENT_ACTION_DELETE_SUCCEEDED,
  payload: {
    action,
  },
});

export const deleteCommentActionFailed = (id, error) => ({
  type: ActionTypes.COMMENT_ACTION_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});
