/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
        webhooks,
        record: inputs.card,
        values: {
          coverAttachmentId: null,
        },
        project: inputs.project,
        board: inputs.board,
        list: inputs.list,
        actorUser: inputs.actorUser,
      });
    }

    const { attachment, fileReference } = await Attachment.qm.deleteOne(inputs.record.id, {
      isFile: inputs.record.type === Attachment.Types.FILE,
    });

    if (attachment) {
      if (fileReference) {
        sails.helpers.attachments.removeUnreferencedFiles(fileReference);
      }

      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'attachmentDelete',
        {
          item: sails.helpers.attachments.presentOne(attachment),
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.ATTACHMENT_DELETE,
        buildData: () => ({
          item: sails.helpers.attachments.presentOne(attachment),
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return attachment;
  },
};
