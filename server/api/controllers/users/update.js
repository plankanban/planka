/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user
 *     description: Updates a user. Users can update their own profile, admins can update any user.
 *     tags:
 *       - Users
 *     operationId: updateUser
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, projectOwner, boardUser]
 *                 description: User role defining access permissions
 *                 example: admin
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Full display name of the user
 *                 example: John Doe
 *               avatar:
 *                 type: object
 *                 nullable: true
 *                 description: Avatar of the user (only null value to remove avatar)
 *                 example: null
 *               phone:
 *                 type: string
 *                 maxLength: 128
 *                 nullable: true
 *                 description: Contact phone number
 *                 example: +1234567890
 *               organization:
 *                 type: string
 *                 maxLength: 128
 *                 nullable: true
 *                 description: Organization or company name
 *                 example: Acme Corporation
 *               language:
 *                 type: string
 *                 enum: [ar-YE, bg-BG, cs-CZ, da-DK, de-DE, el-GR, en-GB, en-US, es-ES, et-EE, fa-IR, fi-FI, fr-FR, hu-HU, id-ID, it-IT, ja-JP, ko-KR, nl-NL, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sk-SK, sr-Cyrl-RS, sr-Latn-RS, sv-SE, tr-TR, uk-UA, uz-UZ, zh-CN, zh-TW]
 *                 description: Preferred language for user interface and notifications
 *                 example: en-US
 *               apiKey:
 *                 type: object
 *                 nullable: true
 *                 description: API key of the user (only null value to remove API key)
 *                 example: null
 *               subscribeToOwnCards:
 *                 type: boolean
 *                 description: Whether the user subscribes to their own cards
 *                 example: false
 *               subscribeToCardWhenCommenting:
 *                 type: boolean
 *                 description: Whether the user subscribes to cards when commenting
 *                 example: true
 *               turnOffRecentCardHighlighting:
 *                 type: boolean
 *                 description: Whether recent card highlighting is disabled
 *                 example: false
 *               enableFavoritesByDefault:
 *                 type: boolean
 *                 description: Whether favorites are enabled by default
 *                 example: false
 *               defaultEditorMode:
 *                 type: string
 *                 enum: [wysiwyg, markup]
 *                 description: Default markdown editor mode
 *                 example: wysiwyg
 *               defaultHomeView:
 *                 type: string
 *                 enum: [gridProjects, groupedProjects]
 *                 description: Default view mode for the home page
 *                 example: groupedProjects
 *               defaultProjectsOrder:
 *                 type: string
 *                 enum: [byDefault, alphabetically, byCreationTime]
 *                 description: Default sort order for projects display
 *                 example: byDefault
 *               isDeactivated:
 *                 type: boolean
 *                 description: Whether the user account is deactivated and cannot log in (for admins)
 *                 example: false
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  ACTIVE_LIMIT_REACHED: {
    activeLimitReached: 'Active limit reached',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(User.Roles),
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    avatar: {
      type: 'json',
      custom: _.isNull,
    },
    phone: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      allowNull: true,
    },
    organization: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      allowNull: true,
    },
    language: {
      type: 'string',
      isIn: User.LANGUAGES,
    },
    apiKey: {
      type: 'json',
      custom: _.isNull,
    },
    subscribeToOwnCards: {
      type: 'boolean',
    },
    subscribeToCardWhenCommenting: {
      type: 'boolean',
    },
    turnOffRecentCardHighlighting: {
      type: 'boolean',
    },
    enableFavoritesByDefault: {
      type: 'boolean',
    },
    defaultEditorMode: {
      type: 'string',
      isIn: Object.values(User.EditorModes),
    },
    defaultHomeView: {
      type: 'string',
      isIn: Object.values(User.HomeViews),
    },
    defaultProjectsOrder: {
      type: 'string',
      isIn: Object.values(User.ProjectOrders),
    },
    isDeactivated: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    activeLimitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const availableInputKeys = ['id', 'name', 'avatar', 'phone', 'organization'];
    if (inputs.id === currentUser.id) {
      availableInputKeys.push(...User.PERSONAL_FIELD_NAMES);
    } else if (currentUser.role === User.Roles.ADMIN) {
      availableInputKeys.push('role', 'isDeactivated');
    } else {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    if (currentUser.role === User.Roles.ADMIN) {
      availableInputKeys.push('apiKey');
    }

    if (_.difference(Object.keys(inputs), availableInputKeys).length > 0) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let user = await User.qm.getOneById(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    // TODO: refactor
    if (user.email === sails.config.custom.defaultAdminEmail) {
      if (inputs.role || inputs.name) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    } else if (user.isSsoUser) {
      if (!sails.config.custom.oidcIgnoreRoles && inputs.role) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }

      if (inputs.name) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = {
      ..._.pick(inputs, [
        'role',
        'name',
        'avatar',
        'phone',
        'organization',
        'language',
        'apiKey',
        'subscribeToOwnCards',
        'subscribeToCardWhenCommenting',
        'turnOffRecentCardHighlighting',
        'enableFavoritesByDefault',
        'defaultEditorMode',
        'defaultHomeView',
        'defaultProjectsOrder',
        'isDeactivated',
      ]),
    };

    user = await sails.helpers.users.updateOne
      .with({
        values,
        record: user,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('activeLimitReached', () => Errors.ACTIVE_LIMIT_REACHED);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
