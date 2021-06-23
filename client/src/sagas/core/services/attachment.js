import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import { isAttachmentWithIdExistsSelector, pathSelector } from '../../../selectors';
import {
  createAttachment,
  deleteAttachment,
  handleAttachmentCreate,
  handleAttachmentDelete,
  handleAttachmentUpdate,
  updateAttachment,
} from '../../../actions';
import api from '../../../api';
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

  let attachment;
  try {
    ({ item: attachment } = yield call(request, api.createAttachment, cardId, data, localId));
  } catch (error) {
    yield put(createAttachment.failure(localId, error));
    return;
  }

  yield put(createAttachment.success(localId, attachment));
}

export function* createAttachmentInCurrentCardService(data) {
  const { cardId } = yield select(pathSelector);

  yield call(createAttachmentService, cardId, data);
}

export function* handleAttachmentCreateService(attachment, requestId) {
  const isExists = yield select(isAttachmentWithIdExistsSelector, requestId);

  if (!isExists) {
    yield put(handleAttachmentCreate(attachment));
  }
}

export function* updateAttachmentService(id, data) {
  yield put(updateAttachment(id, data));

  let attachment;
  try {
    ({ item: attachment } = yield call(request, api.updateAttachment, id, data));
  } catch (error) {
    yield put(updateAttachment.failure(id, error));
    return;
  }

  yield put(updateAttachment.success(attachment));
}

export function* handleAttachmentUpdateService(attachment) {
  yield put(handleAttachmentUpdate(attachment));
}

export function* deleteAttachmentService(id) {
  yield put(deleteAttachment(id));

  let attachment;
  try {
    ({ item: attachment } = yield call(request, api.deleteAttachment, id));
  } catch (error) {
    yield put(deleteAttachment.failure(id, error));
    return;
  }

  yield put(deleteAttachment.success(attachment));
}

export function* handleAttachmentDeleteService(attachment) {
  yield put(handleAttachmentDelete(attachment));
}
