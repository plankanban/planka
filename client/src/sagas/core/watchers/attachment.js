import { all, takeEvery } from 'redux-saga/effects';

import {
  createAttachmentInCurrentCardService,
  deleteAttachmentService,
  handleAttachmentCreateService,
  handleAttachmentDeleteService,
  handleAttachmentUpdateService,
  updateAttachmentService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* attachmentWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ATTACHMENT_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      createAttachmentInCurrentCardService(data),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_CREATE_HANDLE, ({ payload: { attachment, requestId } }) =>
      handleAttachmentCreateService(attachment, requestId),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_UPDATE, ({ payload: { id, data } }) =>
      updateAttachmentService(id, data),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_UPDATE_HANDLE, ({ payload: { attachment } }) =>
      handleAttachmentUpdateService(attachment),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_DELETE, ({ payload: { id } }) =>
      deleteAttachmentService(id),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_DELETE_HANDLE, ({ payload: { attachment } }) =>
      handleAttachmentDeleteService(attachment),
    ),
  ]);
}
