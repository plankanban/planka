/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    user: {
      type: 'ref',
      required: true,
    },
    groupNames: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { user, actorUser } = inputs;
    const groupNames = Array.isArray(inputs.groupNames) ? inputs.groupNames : [];

    const desiredByProjectId = new Map();
    if (groupNames.length > 0) {
      const mappings = await ProjectGroupMapping.qm.getByGroupNames(groupNames);
      mappings.forEach((mapping) => {
        if (!desiredByProjectId.has(mapping.projectId)) {
          desiredByProjectId.set(mapping.projectId, mapping.groupName);
        }
      });
    }

    const existing = await ProjectManager.qm.getByUserIdAndIsFromGroupSync(user.id, true);
    const existingByProjectId = new Map(existing.map((row) => [row.projectId, row]));

    const projectIdsToAdd = [...desiredByProjectId.keys()].filter(
      (projectId) => !existingByProjectId.has(projectId),
    );
    const rowsToRemove = existing.filter((row) => !desiredByProjectId.has(row.projectId));

    const webhooks = await Webhook.qm.getAll();

    // eslint-disable-next-line no-restricted-syntax
    for (const projectId of projectIdsToAdd) {
      // Skip if a non-group manual assignment already exists for this pair —
      // we must not duplicate or clobber it.
      // eslint-disable-next-line no-await-in-loop
      const existingAny = await ProjectManager.qm.getOneByProjectIdAndUserId(projectId, user.id);
      if (!existingAny) {
        // eslint-disable-next-line no-await-in-loop
        const project = await Project.qm.getOneById(projectId);
        if (project) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await sails.helpers.projectManagers.createOne.with({
              webhooks,
              values: {
                project,
                user,
                isFromGroupSync: true,
                sourceGroupName: desiredByProjectId.get(projectId),
              },
              actorUser,
            });
          } catch (error) {
            sails.log.warn(
              `OIDC group sync: failed to grant project ${projectId} to user ${user.id}: ${error}`,
            );
          }
        }
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const row of rowsToRemove) {
      // eslint-disable-next-line no-await-in-loop
      const project = await Project.qm.getOneById(row.projectId);
      if (!project) {
        // eslint-disable-next-line no-await-in-loop
        await ProjectManager.qm.deleteOne(row.id);
      } else {
        try {
          // eslint-disable-next-line no-await-in-loop
          await sails.helpers.projectManagers.deleteOne.with({
            record: row,
            user,
            project,
            actorUser,
          });
        } catch (error) {
          sails.log.warn(
            `OIDC group sync: failed to revoke project ${row.projectId} from user ${user.id}: ${error}`,
          );
        }
      }
    }
  },
};
