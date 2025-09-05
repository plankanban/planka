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
    const fileManager = sails.hooks['file-manager'].getInstance();

    const data = {
      ..._.omit(inputs.record, [
        'password',
        'avatar',
        'termsSignature',
        'passwordChangedAt',
        'termsAcceptedAt',
      ]),
      avatar: inputs.record.avatar && {
        url: `${fileManager.buildUrl(`${sails.config.custom.userAvatarsPathSegment}/${inputs.record.avatar.uploadedFileId}/original.${inputs.record.avatar.extension}`)}`,
        thumbnailUrls: {
          cover180: `${fileManager.buildUrl(`${sails.config.custom.userAvatarsPathSegment}/${inputs.record.avatar.uploadedFileId}/cover-180.${inputs.record.avatar.extension}`)}`,
        },
      },
      termsType: sails.hooks.terms.getTypeByUserRole(inputs.record.role),
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
        if (isDefaultAdmin || inputs.record.isSsoUser) {
          lockedFieldNames.push('email', 'password', 'name');

          if (isDefaultAdmin) {
            lockedFieldNames.push('role', 'username');
          } else if (inputs.record.isSsoUser) {
            if (!sails.config.custom.oidcIgnoreRoles) {
              lockedFieldNames.push('role');
            }
            if (!sails.config.custom.oidcIgnoreUsername) {
              lockedFieldNames.push('username');
            }
          }
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

      return _.omit(data, [...User.PRIVATE_FIELD_NAMES, ...User.PERSONAL_FIELD_NAMES]);
    }

    return data;
  },
};
