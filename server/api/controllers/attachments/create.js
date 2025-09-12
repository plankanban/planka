/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/attachments:
 *   post:
 *     summary: Create attachment
 *     description: Creates an attachment on a card. Requires board editor permissions.
 *     tags:
 *       - Attachments
 *     operationId: createAttachment
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card to create the attachment on
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [file, link]
 *                 description: Type of the attachment
 *                 example: link
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               url:
 *                 type: string
 *                 format: url
 *                 maxLength: 2048
 *                 description: URL for the link attachment
 *                 example: https://google.com/search?q=planka
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the attachment
 *                 example: Important Attachment
 *               requestId:
 *                 type: string
 *                 maxLength: 128
 *                 description: Request ID for tracking
 *                 example: req_123456
 *     responses:
 *       200:
 *         description: Attachment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Attachment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: Upload or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   example: E_UNPROCESSABLE_ENTITY
 *                 message:
 *                   type: string
 *                   enum:
 *                     - No file was uploaded
 *                     - Url must be present
 *                   description: Specific error message
 *                   example: No file was uploaded
 */

const { isUrl } = require('../../../utils/validators');
const { idInput } = require('../../../utils/inputs');

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
  URL_MUST_BE_PRESENT: {
    urlMustBePresent: 'Url must be present',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(Attachment.Types),
      required: true,
    },
    url: {
      type: 'string',
      maxLength: 2048,
      custom: isUrl,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
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
    urlMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let data;
    if (inputs.type === Attachment.Types.FILE) {
      let files;
      try {
        files = await sails.helpers.utils.receiveFile(this.req.file('file'));
      } catch (error) {
        return exits.uploadError(error.message); // TODO: add error
      }

      if (files.length === 0) {
        throw Errors.NO_FILE_WAS_UPLOADED;
      }

      const file = _.last(files);
      data = await sails.helpers.attachments.processUploadedFile(file);
    } else if (inputs.type === Attachment.Types.LINK) {
      if (!inputs.url) {
        throw Errors.URL_MUST_BE_PRESENT;
      }

      data = await sails.helpers.attachments.processLink(inputs.url);
    }

    const values = {
      ..._.pick(inputs, ['type', 'name']),
      data,
    };

    const attachment = await sails.helpers.attachments.createOne.with({
      project,
      board,
      list,
      values: {
        ...values,
        card,
        creatorUser: currentUser,
      },
      requestId: inputs.requestId,
      request: this.req,
    });

    return exits.success({
      item: sails.helpers.attachments.presentOne(attachment),
    });
  },
};
