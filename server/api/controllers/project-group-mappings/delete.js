/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-group-mappings/{id}:
 *   delete:
 *     summary: Delete a project group mapping
 *     description: Removes an OIDC group → project mapping. Existing project_manager
 *                  rows previously created from this mapping are NOT removed
 *                  immediately; they will be reconciled on each user's next OIDC login.
 *                  Admin only.
 *     tags:
 *       - Project Group Mappings
 *     operationId: deleteProjectGroupMapping
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Mapping deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectGroupMapping'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  MAPPING_NOT_FOUND: {
    mappingNotFound: 'Mapping not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    mappingNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (currentUser.role !== User.Roles.ADMIN) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const mapping = await ProjectGroupMapping.qm.getOneById(inputs.id);

    if (!mapping) {
      throw Errors.MAPPING_NOT_FOUND;
    }

    const deleted = await sails.helpers.projectGroupMappings.deleteOne.with({
      record: mapping,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: deleted,
    };
  },
};
