/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /access-tokens/me:
 *   delete:
 *     summary: User logout
 *     description: Logs out the current user by deleting the session and access token. Clears HTTP-only cookies if present.
 *     tags:
 *       - Access Tokens
 *     operationId: deleteAccessToken
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   type: string
 *                   description: Revoked access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ4...
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *     security:
 *       - bearerAuth: []
 */

module.exports = {
  async fn() {
    const { currentSession } = this.req;

    await Session.qm.deleteOneById(currentSession.id);

    sails.sockets.leaveAll(`@accessToken:${currentSession.accessToken}`);

    if (currentSession.httpOnlyToken && !this.req.isSocket) {
      sails.helpers.utils.clearHttpOnlyTokenCookie(this.res);
    }

    return {
      item: currentSession.accessToken,
    };
  },
};
