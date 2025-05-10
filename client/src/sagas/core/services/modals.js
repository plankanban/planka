/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { put } from 'redux-saga/effects';

import actions from '../../../actions';

export function* openModal(type, params) {
  yield put(actions.openModal(type, params));
}

export function* closeModal() {
  yield put(actions.closeModal());
}

export default {
  openModal,
  closeModal,
};
