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

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const attachmentToProjectPath = await sails.helpers
      .getAttachmentToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.ATTACHMENT_NOT_FOUND);

    let { attachment } = attachmentToProjectPath;
    const { board, project } = attachmentToProjectPath;

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name']);
    attachment = await sails.helpers.updateAttachment(attachment, values, board, this.req);

    if (!attachment) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    return exits.success({
      item: attachment,
    });
  },
};
