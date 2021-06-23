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
    name: {
      type: 'string',
      isNotEmptyString: true,
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
    const { board } = path;

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name']);
    attachment = await sails.helpers.attachments.updateOne(attachment, values, board, this.req);

    if (!attachment) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    return {
      item: attachment,
    };
  },
};
