/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Deletes everything that hangs off a user.
 *
 * Children before parents -- see the ordering contract in
 * `helpers/cards/delete-related.js`.
 *
 * The project-ownership step is the one that produced the orphaned
 * `project_manager` row behind #8: the projects this user owned were destroyed
 * first and `projects.deleteRelated()` -- which is what removes the OTHER
 * managers' `project_manager` rows for those same projects -- ran second. A
 * single failure in between left a `project_manager` pointing at a project id
 * that no longer existed, and the client dereferenced it on every render.
 *
 * The user's own `project_manager` rows are therefore fetched, not deleted,
 * until the owned projects and their subtrees are gone. The return value is
 * unchanged: every `project_manager` row belonging to this user.
 *
 * KNOWN RESIDUAL: `project.owner_project_manager_id` and `project_manager.
 * project_id` are a reference CYCLE, so no ordering can be correct in both
 * directions without a transaction. One statement -- the `Project.qm.delete()`
 * immediately below -- still runs while `owner_project_manager_id` dangles,
 * because `projects.deleteRelated()` has just removed the manager rows. That
 * window is two adjacent statements wide and is the same window the previous
 * ordering had; everything larger has been removed. Closing it needs the
 * transaction work that was explicitly ruled out of this change.
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

    await Session.qm.delete({
      userId: userIdOrIds,
    });

    await ProjectFavorite.qm.delete({
      userId: userIdOrIds,
    });

    const projectManagers = await ProjectManager.qm.getByUserId(userIdOrIds);
    const projectManagerIds = sails.helpers.utils.mapRecords(projectManagers);

    const projects = await Project.qm.getByOwnerProjectManagerIds(projectManagerIds);

    await sails.helpers.projects.deleteRelated(projects);

    await Project.qm.delete({
      ownerProjectManagerId: projectManagerIds,
    });

    // Whatever `projects.deleteRelated()` did not already remove, i.e. this
    // user's managerships of projects owned by somebody else.
    await ProjectManager.qm.delete({
      userId: userIdOrIds,
    });

    const boardMemberships = await BoardMembership.qm.delete({
      userId: userIdOrIds,
    });

    await BoardSubscription.qm.delete({
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
