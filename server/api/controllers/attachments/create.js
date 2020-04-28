const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    this.req.file('file').upload(sails.helpers.createAttachmentReceiver(), async (error, files) => {
      if (error) {
        return exits.uploadError(error.message);
      }

      if (files.length === 0) {
        return exits.uploadError('No file was uploaded');
      }

      const file = files[0];

      const attachment = await sails.helpers.createAttachment(
        card,
        currentUser,
        {
          dirname: file.extra.dirname,
          filename: file.filename,
          isImage: file.extra.isImage,
          name: file.extra.name,
        },
        inputs.requestId,
        this.req,
      );

      return exits.success({
        item: attachment.toJSON(),
      });
    });
  },
};
