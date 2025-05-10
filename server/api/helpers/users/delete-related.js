/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    recordOrRecords: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    let userIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: userIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      userIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    await IdentityProviderUser.qm.delete({
      userId: userIdOrIds,
    });

    await Session.qm.delete({
      userId: userIdOrIds,
    });

    await ProjectFavorite.qm.delete({
      userId: userIdOrIds,
    });

    const projectManagers = await ProjectManager.qm.delete({
      userId: userIdOrIds,
    });

    const projectManagerIds = sails.helpers.utils.mapRecords(projectManagers);

    const projects = await Project.qm.delete({
      ownerProjectManagerId: projectManagerIds,
    });

    await sails.helpers.projects.deleteRelated(projects);

    const boardMemberships = await BoardMembership.qm.delete({
      userId: userIdOrIds,
    });

    await Card.qm.update(
      {
        creatorUserId: userIdOrIds,
      },
      {
        creatorUserId: null,
      },
    );

    await CardSubscription.qm.delete({
      userId: userIdOrIds,
    });

    await CardMembership.qm.delete({
      userId: userIdOrIds,
    });

    await Task.qm.update(
      {
        assigneeUserId: userIdOrIds,
      },
      {
        assigneeUserId: null,
      },
    );

    await Attachment.qm.update(
      {
        creatorUserId: userIdOrIds,
      },
      {
        creatorUserId: null,
      },
    );

    await Comment.qm.update(
      {
        userId: userIdOrIds,
      },
      {
        userId: null,
      },
    );

    await Action.qm.update(
      {
        userId: userIdOrIds,
      },
      {
        userId: null,
      },
    );

    await Notification.qm.update(
      {
        creatorUserId: userIdOrIds,
      },
      {
        creatorUserId: null,
      },
    );

    await Notification.qm.delete({
      userId: userIdOrIds,
    });

    await NotificationService.qm.delete({
      userId: userIdOrIds,
    });

    return {
      projectManagers,
      boardMemberships,
    };
  },
};
