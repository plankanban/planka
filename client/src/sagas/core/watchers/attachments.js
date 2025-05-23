/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* attachmentsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ATTACHMENT_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) =>
      services.createAttachmentInCurrentCard(data),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_CREATE_HANDLE, ({ payload: { attachment, requestId } }) =>
      services.handleAttachmentCreate(attachment, requestId),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_UPDATE, ({ payload: { id, data } }) =>
      services.updateAttachment(id, data),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_UPDATE_HANDLE, ({ payload: { attachment } }) =>
      services.handleAttachmentUpdate(attachment),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_DELETE, ({ payload: { id } }) =>
      services.deleteAttachment(id),
    ),
    takeEvery(EntryActionTypes.ATTACHMENT_DELETE_HANDLE, ({ payload: { attachment } }) =>
      services.handleAttachmentDelete(attachment),
    ),
  ]);
}
