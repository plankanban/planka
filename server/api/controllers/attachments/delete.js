const Errors = {
  ATTACHMENT_NOT_FOUND: {
    attachmentNotFound: 'Attachment not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    attachmentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.attachments
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.ATTACHMENT_NOT_FOUND);

    let { attachment } = path;
    const { card, board } = path;

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
    }

    attachment = await sails.helpers.attachments.deleteOne(attachment, board, card, this.req);

    if (!attachment) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    return {
      item: attachment,
    };
  },
};
