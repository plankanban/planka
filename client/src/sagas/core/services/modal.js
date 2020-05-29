import { put } from 'redux-saga/effects';

import { closeModal, openModal } from '../../../actions';

export function* openModalService(type) {
  yield put(openModal(type));
}

export function* closeModalService() {
  yield put(closeModal());
}
