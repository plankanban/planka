/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * PUT /api/users/me/theme — update current user's theme settings.
 * Requires authentication. Accepts cardBackground, cardBorder, cardShadow,
 * cardHoverBackground, cardHoverShadow (all optional strings).
 */

const Errors = {
  UNAUTHORIZED: {
    unauthorized: 'Unauthorized',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

const ALLOWED_KEYS = [
  'cardBackground',
  'cardBorder',
  'cardShadow',
  'cardHoverBackground',
  'cardHoverShadow',
];

module.exports = {
  inputs: {
    cardBackground: { type: 'string', allowNull: true },
    cardBorder: { type: 'string', allowNull: true },
    cardShadow: { type: 'string', allowNull: true },
    cardHoverBackground: { type: 'string', allowNull: true },
    cardHoverShadow: { type: 'string', allowNull: true },
  },

  exits: {
    unauthorized: {
      responseType: 'unauthorized',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser || currentUser.id === User.INTERNAL.id || currentUser.id === User.OIDC.id) {
      throw Errors.UNAUTHORIZED;
    }

    const themeSettings = {};
    for (const key of ALLOWED_KEYS) {
      if (inputs[key] !== undefined) {
        themeSettings[key] = inputs[key];
      }
    }

    const user = await User.qm.getOneById(currentUser.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const newTheme = { ...(user.themeSettings || {}), ...themeSettings };

    await User.updateOne({ id: currentUser.id }).set({ themeSettings: newTheme });

    const updated = await User.qm.getOneById(currentUser.id);

    return {
      item: updated.themeSettings || {},
    };
  },
};
