import ActionTypes from '../constants/ActionTypes';

export const createCommentAction = (action) => ({
  type: ActionTypes.COMMENT_ACTION_CREATE,
  payload: {
    action,
  },
});

createCommentAction.success = (localId, action) => ({
  type: ActionTypes.COMMENT_ACTION_CREATE__SUCCESS,
  payload: {
    localId,
    action,
  },
});

createCommentAction.failure = (localId, error) => ({
  type: ActionTypes.COMMENT_ACTION_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

export const updateCommentAction = (id, data) => ({
  type: ActionTypes.COMMENT_ACTION_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCommentAction.success = (action) => ({
  type: ActionTypes.COMMENT_ACTION_UPDATE__SUCCESS,
  payload: {
    action,
  },
});

updateCommentAction.failure = (id, error) => ({
  type: ActionTypes.COMMENT_ACTION_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const deleteCommentAction = (id) => ({
  type: ActionTypes.COMMENT_ACTION_DELETE,
  payload: {
    id,
  },
});

deleteCommentAction.success = (action) => ({
  type: ActionTypes.COMMENT_ACTION_DELETE__SUCCESS,
  payload: {
    action,
  },
});

deleteCommentAction.failure = (id, error) => ({
  type: ActionTypes.COMMENT_ACTION_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});
