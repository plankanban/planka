/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const { rimraf } = require('rimraf');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    invalidFile: {},
  },

  // TODO: add better validation
  async fn(inputs) {
    const content = await fs.promises.readFile(inputs.file.fd);

    let trelloBoard;
    try {
      trelloBoard = JSON.parse(content);
    } catch (error) {
      await rimraf(inputs.file.fd);
      throw 'invalidFile';
    }

    if (
      !trelloBoard ||
      !_.isArray(trelloBoard.labels) ||
      !_.isArray(trelloBoard.lists) ||
      !_.isArray(trelloBoard.cards) ||
      !_.isArray(trelloBoard.checklists) ||
      !_.isArray(trelloBoard.actions)
    ) {
      await rimraf(inputs.file.fd);
      throw 'invalidFile';
    }

    await rimraf(inputs.file.fd);

    return trelloBoard;
  },
};
