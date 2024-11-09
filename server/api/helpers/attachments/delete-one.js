const path = require('path');
const rimraf = require('rimraf');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    if (inputs.record.id === inputs.card.coverAttachmentId) {
      await sails.helpers.cards.updateOne.with({
        record: inputs.card,
        values: {
          coverAttachmentId: null,
        },
        project: inputs.project,
        board: inputs.board,
        list: inputs.list,
        actorUser: inputs.actorUser,
        request: inputs.request,
      });
    }

    const attachment = await Attachment.archiveOne(inputs.record.id);

    if (attachment) {
      try {
        const type = attachment.type || 'local';
        if (type === 's3') {
          const client = await sails.helpers.attachments.getSimpleStorageServiceClient();
          if (client) {
            const file1 = `${attachment.dirname}/${attachment.filename}`;
            const file2 = `${attachment.dirname}/thumbnails/cover-256.png`;
            await client.delete({ Key: file1 });
            await client.delete({ Key: file2 });
          }
        } else {
          rimraf.sync(path.join(sails.config.custom.attachmentsPath, attachment.dirname));
        }
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

      sails.helpers.utils.sendWebhooks.with({
        event: 'attachmentDelete',
        data: {
          item: attachment,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        },
        user: inputs.actorUser,
      });
    }

    return attachment;
  },
};
