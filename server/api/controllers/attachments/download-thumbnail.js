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

    const { attachment, card, project } = await sails.helpers.attachments
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.ATTACHMENT_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
      }
    }

    if (!attachment.image) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    const fileManager = sails.hooks['file-manager'].getInstance();

    let readStream;
    try {
      readStream = await fileManager.read(
        `${sails.config.custom.attachmentsPathSegment}/${attachment.dirname}/thumbnails/cover-256.${attachment.image.thumbnailsExtension}`,
      );
    } catch (error) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    this.res.type('image/jpeg');
    this.res.set('Cache-Control', 'private, max-age=900'); // TODO: move to config

    return exits.success(readStream);
  },
};
