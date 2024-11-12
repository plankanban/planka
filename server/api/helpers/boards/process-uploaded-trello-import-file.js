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

  async fn(inputs) {
    const content = await fs.promises.readFile(inputs.file.fd);
    const trelloBoard = JSON.parse(content);

    if (
      !trelloBoard ||
      !_.isArray(trelloBoard.lists) ||
      !_.isArray(trelloBoard.cards) ||
      !_.isArray(trelloBoard.checklists) ||
      !_.isArray(trelloBoard.actions)
    ) {
      throw 'invalidFile';
    }

    try {
      await rimraf(inputs.file.fd);
    } catch (error) {
      console.warn(error.stack); // eslint-disable-line no-console
    }

    return trelloBoard;
  },
};
