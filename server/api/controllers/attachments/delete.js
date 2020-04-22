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

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const attachmentToProjectPath = await sails.helpers
      .getAttachmentToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.ATTACHMENT_NOT_FOUND);

    let { attachment } = attachmentToProjectPath;
    const { card, board, project } = attachmentToProjectPath;

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
    }

    attachment = await sails.helpers.deleteAttachment(attachment, card, board, this.req);

    if (!attachment) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    return exits.success({
      item: attachment,
    });
  },
};
