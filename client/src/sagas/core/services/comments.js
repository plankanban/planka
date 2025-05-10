/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* fetchComments(cardId) {
  const { lastCommentId } = yield select(selectors.selectCardById, cardId);

  yield put(actions.fetchComments(cardId));

  let comments;
  let users;

  try {
    ({
      items: comments,
      included: { users },
    } = yield call(request, api.getComments, cardId, {
      beforeId: lastCommentId || undefined,
    }));
  } catch (error) {
    yield put(actions.fetchComments.failure(cardId, error));
    return;
  }

  yield put(actions.fetchComments.success(cardId, comments, users));
}

export function* fetchCommentsInCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(fetchComments, cardId);
}

export function* createComment(cardId, data) {
  const localId = yield call(createLocalId);
  const currentUser = yield select(selectors.selectCurrentUser);

  yield put(
    actions.createComment({
      ...data,
      cardId,
      id: localId,
      userId: currentUser.id,
    }),
  );

  let comment;
  try {
    ({ item: comment } = yield call(request, api.createComment, cardId, data));
  } catch (error) {
    yield put(actions.createComment.failure(localId, error));
    return;
  }

  yield put(actions.createComment.success(localId, comment));
}

export function* createCommentInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createComment, cardId, data);
}

export function* handleCommentCreate(comment, users) {
  yield put(actions.handleCommentCreate(comment, users));
}

export function* updateComment(id, data) {
  yield put(actions.updateComment(id, data));

  let comment;
  try {
    ({ item: comment } = yield call(request, api.updateComment, id, data));
  } catch (error) {
    yield put(actions.updateComment.failure(id, error));
    return;
  }

  yield put(actions.updateComment.success(comment));
}

export function* handleCommentUpdate(comment) {
  yield put(actions.handleCommentUpdate(comment));
}

export function* deleteComment(id) {
  yield put(actions.deleteComment(id));

  let comment;
  try {
    ({ item: comment } = yield call(request, api.deleteComment, id));
  } catch (error) {
    yield put(actions.deleteComment.failure(id, error));
    return;
  }

  yield put(actions.deleteComment.success(comment));
}

export function* handleCommentDelete(comment) {
  yield put(actions.handleCommentDelete(comment));
}

export default {
  fetchComments,
  fetchCommentsInCurrentCard,
  createComment,
  createCommentInCurrentCard,
  handleCommentCreate,
  updateComment,
  handleCommentUpdate,
  deleteComment,
  handleCommentDelete,
};
