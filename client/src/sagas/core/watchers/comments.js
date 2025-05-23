/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* commentsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.COMMENTS_IN_CURRENT_CARD_FETCH, () =>
      services.fetchCommentsInCurrentCard(),
    ),
    takeEvery(EntryActionTypes.COMMENT_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      services.createCommentInCurrentCard(data),
    ),
    takeEvery(EntryActionTypes.COMMENT_CREATE_HANDLE, ({ payload: { comment, users } }) =>
      services.handleCommentCreate(comment, users),
    ),
    takeEvery(EntryActionTypes.COMMENT_UPDATE, ({ payload: { id, data } }) =>
      services.updateComment(id, data),
    ),
    takeEvery(EntryActionTypes.COMMENT_UPDATE_HANDLE, ({ payload: { comment } }) =>
      services.handleCommentUpdate(comment),
    ),
    takeEvery(EntryActionTypes.COMMENT_DELETE, ({ payload: { id } }) => services.deleteComment(id)),
    takeEvery(EntryActionTypes.COMMENT_DELETE_HANDLE, ({ payload: { comment } }) =>
      services.handleCommentDelete(comment),
    ),
  ]);
}
