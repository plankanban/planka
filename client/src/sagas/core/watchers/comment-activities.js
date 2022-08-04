import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* commentActivitiesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.COMMENT_ACTIVITY_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      services.createCommentActivityInCurrentCard(data),
    ),
    takeEvery(EntryActionTypes.COMMENT_ACTIVITY_UPDATE, ({ payload: { id, data } }) =>
      services.updateCommentActivity(id, data),
    ),
    takeEvery(EntryActionTypes.COMMENT_ACTIVITY_DELETE, ({ payload: { id } }) =>
      services.deleteCommentActivity(id),
    ),
  ]);
}
