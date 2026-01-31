/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * GET /api/users/me/theme — get current user's theme settings.
 * Requires authentication.
 */

const DEFAULT_THEME = {
  cardBackground: '#f8f9fa',
  cardBorder: '#e9ecef',
  cardShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  cardHoverBackground: '#f1f3f5',
  cardHoverShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
};

const Errors = {
  UNAUTHORIZED: {
    unauthorized: 'Unauthorized',
  },
};

module.exports = {
  inputs: {},

  exits: {
    unauthorized: {
      responseType: 'unauthorized',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!currentUser || currentUser.id === User.INTERNAL.id || currentUser.id === User.OIDC.id) {
      throw Errors.UNAUTHORIZED;
    }

    const theme = currentUser.themeSettings || DEFAULT_THEME;

    return {
      item: { ...DEFAULT_THEME, ...theme },
    };
  },
};
