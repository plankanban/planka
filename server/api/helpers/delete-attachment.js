const path = require('path');
const rimraf = require('rimraf');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const attachment = await Attachment.archiveOne(inputs.record.id);

    if (attachment) {
      try {
        rimraf.sync(path.join(sails.config.custom.attachmentsPath, attachment.dirname));
      } catch (error) {
        console.warn(error.stack); // eslint-disable-line no-console
      }

      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'attachmentDelete',
        {
          item: attachment,
        },
        inputs.request,
      );
    }

    return exits.success(attachment);
  },
};
