import { all, takeLatest } from 'redux-saga/effects';

import {
  createAttachmentInCurrentCardService,
  deleteAttachmentService,
  updateAttachmentService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* attachmentWatchers() {
  yield all([
    takeLatest(EntryActionTypes.ATTACHMENT_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      createAttachmentInCurrentCardService(data),
    ),
    takeLatest(EntryActionTypes.ATTACHMENT_UPDATE, ({ payload: { id, data } }) =>
      updateAttachmentService(id, data),
    ),
    takeLatest(EntryActionTypes.ATTACHMENT_DELETE, ({ payload: { id } }) =>
      deleteAttachmentService(id),
    ),
  ]);
}
