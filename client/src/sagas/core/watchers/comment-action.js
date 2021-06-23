import { all, takeEvery } from 'redux-saga/effects';

import {
  createCommentActionInCurrentCardService,
  deleteCommentActionService,
  updateCommentActionService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* commentActionWatchers() {
  yield all([
    takeEvery(EntryActionTypes.COMMENT_ACTION_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      createCommentActionInCurrentCardService(data),
    ),
    takeEvery(EntryActionTypes.COMMENT_ACTION_UPDATE, ({ payload: { id, data } }) =>
      updateCommentActionService(id, data),
    ),
    takeEvery(EntryActionTypes.COMMENT_ACTION_DELETE, ({ payload: { id } }) =>
      deleteCommentActionService(id),
    ),
  ]);
}
