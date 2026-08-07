/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
    },
  },

  fn(inputs) {
    const recoveryCodes = inputs.record.totpRecoveryCodes;

    const data = {
      ..._.omit(inputs.record, [
        'password',
        'avatar',
        'apiKeyHash',
        'termsSignature',
        'passwordChangedAt',
        'apiKeyCreatedAt',
        'termsAcceptedAt',
        'totpSecret',
        'totpRecoveryCodes',
      ]),
      avatar: inputs.record.avatar && {
        url: `${sails.config.custom.baseUrl}/user-avatars/${inputs.record.avatar.uploadedFileId}/original.${inputs.record.avatar.extension}`,
        thumbnailUrls: {
          cover180: `${sails.config.custom.baseUrl}/user-avatars/${inputs.record.avatar.uploadedFileId}/cover-180.${inputs.record.avatar.extension}`,
        },
      },
      language: inputs.record.language || sails.config.i18n.defaultLocale,
      totpRecoveryCodesRemaining: Array.isArray(recoveryCodes) ? recoveryCodes.length : 0,
    };

    const gravatarUrl = sails.helpers.users.buildGravatarUrl(inputs.record);

    if (gravatarUrl) {
      data.gravatarUrl = gravatarUrl;
    }

    if (inputs.user) {
      const isForCurrentUser = inputs.record.id === inputs.user.id;
      const isForAdmin = inputs.user.role === User.Roles.ADMIN;

      if (isForCurrentUser || isForAdmin) {
        const isDefaultAdmin = inputs.record.email === sails.config.custom.defaultAdminEmail;

        const lockedFieldNames = [];
        if (sails.config.custom.demoMode) {
          lockedFieldNames.push('email', 'password', 'role', 'name', 'username');
        } else if (isDefaultAdmin) {
          lockedFieldNames.push('email', 'password', 'name', 'role', 'username');
        }

        Object.assign(data, {
          isDefaultAdmin,
          lockedFieldNames,
        });

        if (isForCurrentUser) {
          return data;
        }

        return _.omit(data, User.PERSONAL_FIELD_NAMES);
      }

      return _.omit(data, [
        ...User.PRIVATE_FIELD_NAMES,
        ...User.PERSONAL_FIELD_NAMES,
        ...User.TWO_FACTOR_VISIBLE_FIELD_NAMES,
      ]);
    }

    return data;
  },
};
