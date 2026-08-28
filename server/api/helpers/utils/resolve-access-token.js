/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Everything that has to be true before an access token means anything, in one
// place. A valid signature is the first of five, not the whole answer: a token
// keeps its signature after the session behind it was revoked, after the
// account was deactivated, and after the password was changed — and the default
// lifetime is a year.
//
// It lives here rather than inside the `current-user` hook because the routes
// that serve avatars, background images and favicons need the same answer, and
// when they had their own shortened version of it they let revoked tokens
// through for as long as the signature lasted.
//
// Returns null whenever the token should not be honoured, so a caller cannot
// mistake "no session" for a session.

module.exports = {
  inputs: {
    accessToken: {
      type: 'string',
      required: true,
    },
    // The paired cookie value, where the session was issued with one. A session
    // that carries an httpOnlyToken is only valid alongside its cookie.
    httpOnlyToken: {
      type: 'string',
      allowNull: true,
    },
  },

  async fn(inputs) {
    let payload;
    try {
      payload = sails.helpers.utils.verifyJwtToken(inputs.accessToken);
    } catch (error) {
      return null;
    }

    const session = await Session.qm.getOneUndeletedByAccessToken(inputs.accessToken);

    if (!session) {
      return null;
    }

    if (session.httpOnlyToken && inputs.httpOnlyToken !== session.httpOnlyToken) {
      return null;
    }

    const user = await User.qm.getOneById(payload.subject, {
      withDeactivated: false,
    });

    if (!user) {
      return null;
    }

    if (user.passwordChangedAt > payload.issuedAt) {
      return null;
    }

    return {
      session,
      user,
    };
  },
};
