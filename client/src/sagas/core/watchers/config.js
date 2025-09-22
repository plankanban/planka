/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* configWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CONFIG_UPDATE, ({ payload: { data } }) =>
      services.updateConfig(data),
    ),
    takeEvery(EntryActionTypes.CONFIG_UPDATE_HANDLE, ({ payload: { config } }) =>
      services.handleConfigUpdate(config),
    ),
    takeEvery(EntryActionTypes.SMTP_CONFIG_TEST, () => services.testSmtpConfig()),
  ]);
}
