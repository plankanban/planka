/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const updateConfig = (data) => ({
  type: ActionTypes.CONFIG_UPDATE,
  payload: {
    data,
  },
});

updateConfig.success = (config) => ({
  type: ActionTypes.CONFIG_UPDATE__SUCCESS,
  payload: {
    config,
  },
});

updateConfig.failure = (error) => ({
  type: ActionTypes.CONFIG_UPDATE__FAILURE,
  payload: {
    error,
  },
});

const handleConfigUpdate = (config) => ({
  type: ActionTypes.CONFIG_UPDATE_HANDLE,
  payload: {
    config,
  },
});

const testSmtpConfig = () => ({
  type: ActionTypes.SMTP_CONFIG_TEST,
  payload: {},
});

testSmtpConfig.success = (logs) => ({
  type: ActionTypes.SMTP_CONFIG_TEST__SUCCESS,
  payload: {
    logs,
  },
});

testSmtpConfig.failure = (error) => ({
  type: ActionTypes.SMTP_CONFIG_TEST__FAILURE,
  payload: {
    error,
  },
});

export default {
  updateConfig,
  handleConfigUpdate,
  testSmtpConfig,
};
