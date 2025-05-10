/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { execFile } = require('child_process');
const util = require('util');

const promisifyExecFile = util.promisify(execFile);

module.exports = {
  inputs: {
    services: {
      type: 'json',
      required: true,
    },
    title: {
      type: 'string',
      required: true,
    },
    bodyByFormat: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    return promisifyExecFile(`${sails.config.appPath}/.venv/bin/python3`, [
      `${sails.config.appPath}/utils/send_notifications.py`,
      JSON.stringify(inputs.services),
      inputs.title,
      JSON.stringify(inputs.bodyByFormat),
    ]);
  },
};
