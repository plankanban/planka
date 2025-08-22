/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { getRemoteAddress } = require('../../../utils/remote-address');

const { AccessTokenSteps } = require('../../../constants');

const Errors = {
  INVALID_PENDING_TOKEN: {
    invalidPendingToken: 'Invalid pending token',
  },
  INVALID_SIGNATURE: {
    invalidSignature: 'Invalid signature',
  },
  ADMIN_LOGIN_REQUIRED_TO_INITIALIZE_INSTANCE: {
    adminLoginRequiredToInitializeInstance: 'Admin login required to initialize instance',
  },
};

module.exports = {
  inputs: {
    pendingToken: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
    signature: {
      type: 'string',
      minLength: 64,
      maxLength: 64,
      required: true,
    },
  },

  exits: {
    invalidPendingToken: {
      responseType: 'unauthorized',
    },
    invalidSignature: {
      responseType: 'forbidden',
    },
    adminLoginRequiredToInitializeInstance: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const remoteAddress = getRemoteAddress(this.req);
    const { httpOnlyToken } = this.req.cookies;

    try {
      payload = sails.helpers.utils.verifyJwtToken(inputs.pendingToken);
    } catch (error) {
      if (error.raw.name === 'TokenExpiredError') {
        throw Errors.INVALID_PENDING_TOKEN;
      }

      sails.log.warn(`Invalid pending token! (IP: ${remoteAddress})`);
      throw Errors.INVALID_PENDING_TOKEN;
    }

    if (payload.subject !== AccessTokenSteps.ACCEPT_TERMS) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    let session = await Session.qm.getOneUndeletedByPendingToken(inputs.pendingToken);

    if (!session) {
      sails.log.warn(`Invalid pending token! (IP: ${remoteAddress})`);
      throw Errors.INVALID_PENDING_TOKEN;
    }

    if (session.httpOnlyToken && httpOnlyToken !== session.httpOnlyToken) {
      throw Errors.INVALID_PENDING_TOKEN;
    }

    let user = await User.qm.getOneById(session.userId, {
      withDeactivated: false,
    });

    if (!user) {
      throw Errors.INVALID_PENDING_TOKEN; // TODO: introduce separate error?
    }

    if (!user.termsSignature) {
      const termsSignature = sails.hooks.terms.getSignatureByUserRole(user.role);

      if (inputs.signature !== termsSignature) {
        throw Errors.INVALID_SIGNATURE;
      }

      ({ user } = await User.qm.updateOne(user.id, {
        termsSignature,
        termsAcceptedAt: new Date().toISOString(),
      }));
    }

    const config = await Config.qm.getOneMain();

    if (!config.isInitialized) {
      if (user.role === User.Roles.ADMIN) {
        await Config.qm.updateOneMain({
          isInitialized: true,
        });
      } else {
        throw Errors.ADMIN_LOGIN_REQUIRED_TO_INITIALIZE_INSTANCE;
      }
    }

    const { token: accessToken, payload: accessTokenPayload } = sails.helpers.utils.createJwtToken(
      user.id,
    );

    session = await Session.qm.updateOne(session.id, {
      accessToken,
      pendingToken: null,
    });

    if (session.httpOnlyToken && !this.req.isSocket) {
      sails.helpers.utils.setHttpOnlyTokenCookie(
        session.httpOnlyToken,
        accessTokenPayload,
        this.res,
      );
    }

    return {
      item: accessToken,
    };
  },
};
