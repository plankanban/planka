/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create project
 *     description: Creates a project. The current user automatically becomes a project manager.
 *     tags:
 *       - Projects
 *     operationId: createProject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [public, private]
 *                 description: Type of the project
 *                 example: private
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
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Project'
 *                 included:
 *                   type: object
 *                   required:
 *                     - projectManagers
 *                   properties:
 *                     projectManagers:
 *                       type: array
 *                       description: Related project managers
 *                       items:
 *                         $ref: '#/components/schemas/ProjectManager'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = {
  inputs: {
    type: {
      type: 'string',
      isIn: Object.values(Project.Types),
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['type', 'name', 'description']);

    const { project, projectManager } = await sails.helpers.projects.createOne.with({
      values,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: project,
      included: {
        projectManagers: [projectManager],
      },
    };
  },
};
