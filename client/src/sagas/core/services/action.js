import { put } from 'redux-saga/effects';

import { handleActionCreate, handleActionDelete, handleActionUpdate } from '../../../actions';

export function* handleActionCreateService(action) {
  yield put(handleActionCreate(action));
}

export function* handleActionUpdateService(action) {
  yield put(handleActionUpdate(action));
}

export function* handleActionDeleteService(action) {
  yield put(handleActionDelete(action));
}
