import { put } from 'redux-saga/effects';

import actions from '../../../actions';

export function* openModal(type) {
  yield put(actions.openModal(type));
}

export function* closeModal() {
  yield put(actions.closeModal());
}

export default {
  openModal,
  closeModal,
};
