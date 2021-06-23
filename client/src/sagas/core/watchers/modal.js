import { all, takeEvery } from 'redux-saga/effects';

import { closeModalService, openModalService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* modalWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MODAL_OPEN, ({ payload: { type } }) => openModalService(type)),
    takeEvery(EntryActionTypes.MODAL_CLOSE, () => closeModalService()),
  ]);
}
