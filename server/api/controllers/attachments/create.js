const util = require('util');
const { v4: uuid } = require('uuid');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  NO_FILE_WAS_UPLOADED: {
    noFileWasUploaded: 'No file was uploaded',
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    noFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const upload = util.promisify((options, callback) =>
      this.req.file('file').upload(options, (error, files) => callback(error, files)),
    );

    let files;
    try {
      files = await upload({
        saveAs: uuid(),
        maxBytes: null,
      });
    } catch (error) {
      return exits.uploadError(error.message); // TODO: add error
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);
    const fileData = await sails.helpers.attachments.processUploadedFile(file);

    const attachment = await sails.helpers.attachments.createOne.with({
      project,
      board,
      list,
      values: {
        ...fileData,
        card,
        creatorUser: currentUser,
      },
      requestId: inputs.requestId,
      request: this.req,
    });

    return exits.success({
      item: attachment,
    });
  },
};
