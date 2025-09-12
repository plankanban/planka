/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /access-tokens/revoke-pending-token:
 *   post:
 *     summary: Revoke pending token
 *     description: Revokes a pending authentication token and cancels the authentication flow.
 *     tags:
 *       - Access Tokens
 *     operationId: revokePendingToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pendingToken
 *             properties:
 *               pendingToken:
 *                 type: string
 *                 maxLength: 1024
 *                 description: Pending token to revoke
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ4...
 *     responses:
 *       200:
 *         description: Pending token revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *     security: []
 */

const Errors = {
  PENDING_TOKEN_NOT_FOUND: {
    pendingTokenNotFound: 'Pending token not found',
  },
};

module.exports = {
  inputs: {
    pendingToken: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
  },

  exits: {
    pendingTokenNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { httpOnlyToken } = this.req.cookies;
    let session = await Session.qm.getOneUndeletedByPendingToken(inputs.pendingToken);

    if (!session) {
      throw Errors.PENDING_TOKEN_NOT_FOUND;
    }

    if (session.httpOnlyToken && httpOnlyToken !== session.httpOnlyToken) {
      throw Errors.PENDING_TOKEN_NOT_FOUND; // Forbidden
    }

    session = await Session.qm.deleteOneById(session.id);

    if (session.httpOnlyToken && !this.req.isSocket) {
      sails.helpers.utils.clearHttpOnlyTokenCookie(this.res);
    }

    return {
      item: null,
    };
  },
};
