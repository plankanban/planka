/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Update project
 *     description: Updates a project. Accessible fields depend on user permissions.
 *     tags:
 *       - Projects
 *     operationId: updateProject
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to update
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
 *               ownerProjectManagerId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the project manager who owns the project
 *                 example: "1357158568008091265"
 *               backgroundImageId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the background image used as background
 *                 example: "1357158568008091266"
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the project
 *                 example: Development Project
 *               description:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Detailed description of the project
 *                 example: A project for developing new features...
 *               backgroundType:
 *                 type: string
 *                 enum: [gradient, image]
 *                 nullable: true
 *                 description: Type of background for the project
 *                 example: gradient
 *               backgroundGradient:
 *                 type: string
 *                 enum: [old-lime, ocean-dive, tzepesch-style, jungle-mesh, strawberry-dust, purple-rose, sun-scream, warm-rust, sky-change, green-eyes, blue-xchange, blood-orange, sour-peel, green-ninja, algae-green, coral-reef, steel-grey, heat-waves, velvet-lounge, purple-rain, blue-steel, blueish-curve, prism-light, green-mist, red-curtain]
 *                 nullable: true
 *                 description: Gradient background for the project
 *                 example: ocean-dive
 *               isHidden:
 *                 type: boolean
 *                 description: Whether the project is hidden
 *                 example: false
 *               isFavorite:
 *                 type: boolean
 *                 description: Whether the project is marked as favorite by the current user
 *                 example: true
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Project'
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
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  OWNER_PROJECT_MANAGER_NOT_FOUND: {
    ownerProjectManagerNotFound: 'Owner project manager not found',
  },
  BACKGROUND_IMAGE_NOT_FOUND: {
    backgroundImageNotFound: 'Background image not found',
  },
  PROJECT_ALREADY_HAS_OWNER_PROJECT_MANAGER: {
    projectAlreadyHasOwnerProjectManager: 'Project already has owner project manager',
  },
  OWNER_PROJECT_MANAGER_MUST_BE_LAST_MANAGER: {
    ownerProjectManagerMustBeLastManager: 'Owner project manager must be last manager',
  },
  BACKGROUND_IMAGE_MUST_BE_PRESENT: {
    backgroundImageMustBePresent: 'Background image must be present',
  },
  BACKGROUND_GRADIENT_MUST_BE_PRESENT: {
    backgroundGradientMustBePresent: 'Background gradient must be present',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    ownerProjectManagerId: {
      ...idInput,
      allowNull: true,
    },
    backgroundImageId: {
      ...idInput,
      allowNull: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    },
    backgroundType: {
      type: 'string',
      isIn: Object.values(Project.BackgroundTypes),
      allowNull: true,
    },
    backgroundGradient: {
      type: 'string',
      isIn: Project.BACKGROUND_GRADIENTS,
      allowNull: true,
    },
    isHidden: {
      type: 'boolean',
    },
    isFavorite: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    ownerProjectManagerNotFound: {
      responseType: 'notFound',
    },
    backgroundImageNotFound: {
      responseType: 'notFound',
    },
    projectAlreadyHasOwnerProjectManager: {
      responseType: 'conflict',
    },
    ownerProjectManagerMustBeLastManager: {
      responseType: 'unprocessableEntity',
    },
    backgroundImageMustBePresent: {
      responseType: 'unprocessableEntity',
    },
    backgroundGradientMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let project = await Project.qm.getOneById(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const projectManager = await ProjectManager.qm.getOneByProjectIdAndUserId(
      project.id,
      currentUser.id,
    );

    const availableInputKeys = ['id', 'isFavorite'];
    if (project.ownerProjectManagerId) {
      if (projectManager) {
        if (!_.isNil(inputs.ownerProjectManagerId)) {
          throw Errors.NOT_ENOUGH_RIGHTS;
        }

        availableInputKeys.push('ownerProjectManagerId', 'isHidden');
      }
    } else if (currentUser.role === User.Roles.ADMIN) {
      availableInputKeys.push('ownerProjectManagerId', 'isHidden');
    } else if (projectManager) {
      availableInputKeys.push('isHidden');
    }

    if (projectManager) {
      availableInputKeys.push(
        'backgroundImageId',
        'name',
        'description',
        'backgroundType',
        'backgroundGradient',
      );
    }

    if (_.difference(Object.keys(inputs), availableInputKeys).length > 0) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let nextOwnerProjectManager;
    if (inputs.ownerProjectManagerId) {
      nextOwnerProjectManager = await ProjectManager.qm.getOneById(inputs.ownerProjectManagerId, {
        projectId: project.id,
      });

      if (!nextOwnerProjectManager) {
        throw Errors.OWNER_PROJECT_MANAGER_NOT_FOUND;
      }

      delete inputs.ownerProjectManagerId; // eslint-disable-line no-param-reassign
    }

    let nextBackgroundImage;
    if (inputs.backgroundImageId) {
      nextBackgroundImage = await BackgroundImage.qm.getOneById(inputs.backgroundImageId, {
        projectId: project.id,
      });

      if (!nextBackgroundImage) {
        throw Errors.BACKGROUND_IMAGE_NOT_FOUND;
      }

      delete inputs.backgroundImageId; // eslint-disable-line no-param-reassign
    }

    if (!_.isUndefined(inputs.isFavorite)) {
      if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
        if (!projectManager) {
          const boardMembershipsTotal =
            await sails.helpers.projects.getBoardMembershipsTotalByIdAndUserId(
              project.id,
              currentUser.id,
            );

          if (boardMembershipsTotal === 0) {
            throw Errors.PROJECT_NOT_FOUND; // Forbidden
          }
        }
      }
    }

    const values = _.pick(inputs, [
      'ownerProjectManagerId',
      'backgroundImageId',
      'name',
      'description',
      'backgroundType',
      'backgroundGradient',
      'isHidden',
      'isFavorite',
    ]);

    project = await sails.helpers.projects.updateOne
      .with({
        record: project,
        values: {
          ...values,
          ownerProjectManager: nextOwnerProjectManager,
          backgroundImage: nextBackgroundImage,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept(
        'ownerProjectManagerInValuesMustBeLastManager',
        () => Errors.OWNER_PROJECT_MANAGER_MUST_BE_LAST_MANAGER,
      )
      .intercept(
        'backgroundImageInValuesMustBePresent',
        () => Errors.BACKGROUND_IMAGE_MUST_BE_PRESENT,
      )
      .intercept(
        'backgroundGradientInValuesMustBePresent',
        () => Errors.BACKGROUND_GRADIENT_MUST_BE_PRESENT,
      )
      .intercept(
        'alreadyHasOwnerProjectManager',
        () => Errors.PROJECT_ALREADY_HAS_OWNER_PROJECT_MANAGER,
      );

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    return {
      item: project,
    };
  },
};
