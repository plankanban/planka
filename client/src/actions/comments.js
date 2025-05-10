/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchComments = (cardId) => ({
  type: ActionTypes.COMMENTS_FETCH,
  payload: {
    cardId,
  },
});

fetchComments.success = (cardId, comments, users) => ({
  type: ActionTypes.COMMENTS_FETCH__SUCCESS,
  payload: {
    cardId,
    comments,
    users,
  },
});

fetchComments.failure = (cardId, error) => ({
  type: ActionTypes.COMMENTS_FETCH__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const createComment = (comment) => ({
  type: ActionTypes.COMMENT_CREATE,
  payload: {
    comment,
  },
});

createComment.success = (localId, comment) => ({
  type: ActionTypes.COMMENT_CREATE__SUCCESS,
  payload: {
    localId,
    comment,
  },
});

createComment.failure = (localId, error) => ({
  type: ActionTypes.COMMENT_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCommentCreate = (comment, users) => ({
  type: ActionTypes.COMMENT_CREATE_HANDLE,
  payload: {
    comment,
    users,
  },
});

const updateComment = (id, data) => ({
  type: ActionTypes.COMMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

updateComment.success = (comment) => ({
  type: ActionTypes.COMMENT_UPDATE__SUCCESS,
  payload: {
    comment,
  },
});

updateComment.failure = (id, error) => ({
  type: ActionTypes.COMMENT_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCommentUpdate = (comment) => ({
  type: ActionTypes.COMMENT_UPDATE_HANDLE,
  payload: {
    comment,
  },
});

const deleteComment = (id) => ({
  type: ActionTypes.COMMENT_DELETE,
  payload: {
    id,
  },
});

deleteComment.success = (comment) => ({
  type: ActionTypes.COMMENT_DELETE__SUCCESS,
  payload: {
    comment,
  },
});

deleteComment.failure = (id, error) => ({
  type: ActionTypes.COMMENT_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCommentDelete = (comment) => ({
  type: ActionTypes.COMMENT_DELETE_HANDLE,
  payload: {
    comment,
  },
});

export default {
  fetchComments,
  createComment,
  handleCommentCreate,
  updateComment,
  handleCommentUpdate,
  deleteComment,
  handleCommentDelete,
};
