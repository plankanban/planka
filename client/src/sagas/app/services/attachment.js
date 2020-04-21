import { call, put, select } from 'redux-saga/effects';

import {
  createAttachmentRequest,
  deleteAttachmentRequest,
  updateAttachmentRequest,
} from '../requests';
import { pathSelector } from '../../../selectors';
import { createAttachment, deleteAttachment, updateAttachment } from '../../../actions';
import { createLocalId } from '../../../utils/local-id';

export function* createAttachmentService(cardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    createAttachment({
      cardId,
      id: localId,
      name: data.file.name,
    }),
  );

  yield call(createAttachmentRequest, cardId, localId, data);
}

export function* createAttachmentInCurrentCardService(data) {
  const { cardId } = yield select(pathSelector);

  yield call(createAttachmentService, cardId, data);
}

export function* updateAttachmentService(id, data) {
  yield put(updateAttachment(id, data));
  yield call(updateAttachmentRequest, id, data);
}

export function* deleteAttachmentService(id) {
  yield put(deleteAttachment(id));
  yield call(deleteAttachmentRequest, id);
}
