/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
