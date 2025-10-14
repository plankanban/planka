/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user
 *     description: Creates a user account. Requires admin privileges.
 *     tags:
 *       - Users
 *     operationId: createUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 256
 *                 description: Email address for login and notifications
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 maxLength: 256
 *                 description: Password for user authentication (must meet password requirements)
 *                 example: SecurePassword123!
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
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 16
 *                 pattern: "^[a-zA-Z0-9]+((_{1}|\\.|){1}[a-zA-Z0-9])*$"
 *                 nullable: true
 *                 description: Unique username for user identification
 *                 example: john_doe
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
 *                 nullable: true
 *                 description: Preferred language for user interface and notifications (if null - will be set automatically on the first login)
 *                 example: en-US
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
 *     responses:
 *       200:
 *         description: User created successfully
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
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const { isPassword } = require('../../../utils/validators');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
  },
  ACTIVE_LIMIT_REACHED: {
    activeLimitReached: 'Active limit reached',
  },
};

module.exports = {
  inputs: {
    email: {
      type: 'string',
      maxLength: 256,
      isEmail: true,
      required: true,
    },
    password: {
      type: 'string',
      maxLength: 256,
      custom: isPassword,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(User.Roles),
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
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
      allowNull: true,
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
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
    activeLimitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (sails.config.custom.oidcEnforced) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, [
      'email',
      'password',
      'role',
      'name',
      'username',
      'phone',
      'organization',
      'language',
      'subscribeToOwnCards',
      'subscribeToCardWhenCommenting',
      'turnOffRecentCardHighlighting',
    ]);

    const user = await sails.helpers.users.createOne
      .with({
        values,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE)
      .intercept('activeLimitReached', () => Errors.ACTIVE_LIMIT_REACHED);

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
