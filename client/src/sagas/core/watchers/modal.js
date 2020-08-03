import { all, takeLatest } from 'redux-saga/effects';

import { closeModalService, openModalService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* modalWatchers() {
  yield all([
    takeLatest(EntryActionTypes.MODAL_OPEN, ({ payload: { type } }) => openModalService(type)),
    takeLatest(EntryActionTypes.MODAL_CLOSE, () => closeModalService()),
  ]);
}
