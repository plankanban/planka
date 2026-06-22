/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{id}/export:
 *   get:
 *     summary: Export project as JSON
 *     description: Exports the project data in JSON format.
 *     tags:
 *       - Projects
 *     operationId: exportProject
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to retrieve
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
 *         content:
 *           text/json
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    exportCards: {
      type: 'boolean',
      description: 'Whether to include cards in the export.',
      defaultsTo: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.id);

    const { exportCards } = inputs;

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const boardMemberships = await BoardMembership.qm.getByProjectIdAndUserId(
      project.id,
      currentUser.id,
    );

    let boards;
    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      if (!isProjectManager) {
        if (boardMemberships.length === 0) {
          throw Errors.PROJECT_NOT_FOUND; // Forbidden
        }

        const boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
        boards = await Board.qm.getByIds(boardIds);
      }
    }

    if (!boards) {
      boards = await Board.qm.getByProjectId(project.id);
    }
    if (boards) {
      boards.forEach(async (board) => {
        const boardid = board.id;

        // eslint-disable-next-line no-param-reassign
        delete board.id;
        // eslint-disable-next-line no-param-reassign
        delete board.projectId;
        // eslint-disable-next-line no-param-reassign
        delete board.createdAt;
        // eslint-disable-next-line no-param-reassign
        delete board.updatedAt;

        // eslint-disable-next-line no-param-reassign
        board.labels = (await Label.qm.getByBoardId(boardid)).map((label, idx) => {
          // eslint-disable-next-line no-param-reassign
          label.oldid = label.id;
          // eslint-disable-next-line no-param-reassign
          label.id = idx + 1;
          return label;
        });

        // eslint-disable-next-line no-param-reassign
        board.lists = await List.qm.getByBoardId(boardid);

        board.lists.forEach(async (list) => {
          const listId = list.id;
          // eslint-disable-next-line no-param-reassign
          delete list.id;
          // eslint-disable-next-line no-param-reassign
          delete list.boardId;
          // eslint-disable-next-line no-param-reassign
          delete list.createdAt;
          // eslint-disable-next-line no-param-reassign
          delete list.updatedAt;

          if (exportCards) {
            // eslint-disable-next-line no-param-reassign
            list.cards = await Card.qm.getByListId(listId);

            const cardIds = list.cards.map((card) => card.id);

            const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

            const attachments = await Attachment.qm.getByCardIds(cardIds);

            list.cards.forEach(async (card) => {
              const cardId = card.id;
              // eslint-disable-next-line no-param-reassign
              card.attachments = attachments.filter((attachment) => attachment.cardId === cardId);

              const taskLists = await TaskList.qm.getByCardIds(cardId);
              const taskListIds = sails.helpers.utils.mapRecords(taskLists);

              const tasks = await Task.qm.getByTaskListIds(taskListIds);

              // eslint-disable-next-line no-param-reassign
              card.taskLists = taskLists.map((taskList) => {
                // eslint-disable-next-line no-param-reassign
                taskList.tasks = tasks
                  .filter((task) => task.taskListId === taskList.id)
                  .map((task) => {
                    // eslint-disable-next-line no-param-reassign
                    delete task.id;
                    // eslint-disable-next-line no-param-reassign
                    delete task.taskListId;
                    // eslint-disable-next-line no-param-reassign
                    delete task.createdAt;
                    // eslint-disable-next-line no-param-reassign
                    delete task.updatedAt;
                    return task;
                  });

                // eslint-disable-next-line no-param-reassign
                delete taskList.createdAt;
                // eslint-disable-next-line no-param-reassign
                delete taskList.updatedAt;
                // eslint-disable-next-line no-param-reassign
                delete taskList.cardId;
                // eslint-disable-next-line no-param-reassign
                delete taskList.id;

                return taskList;
              });

              // eslint-disable-next-line no-param-reassign
              card.labels = cardLabels
                .filter((cardLabel) => cardLabel.cardId === cardId)
                .map((cardLabel) => {
                  const label = board.labels.find((l) => l.oldid === cardLabel.labelId);
                  return label ? label.id : null;
                });

              // eslint-disable-next-line no-param-reassign
              delete card.id;
              // eslint-disable-next-line no-param-reassign
              delete card.createdAt;
              // eslint-disable-next-line no-param-reassign
              delete card.updatedAt;

              // eslint-disable-next-line no-param-reassign
              delete card.commentsTotal;
              // eslint-disable-next-line no-param-reassign
              delete card.listChangedAt;
              // eslint-disable-next-line no-param-reassign
              delete card.boardId;
              // eslint-disable-next-line no-param-reassign
              delete card.listId;
              // eslint-disable-next-line no-param-reassign
              delete card.creatorUserId;
              // eslint-disable-next-line no-param-reassign
              delete card.prevListId;
              // eslint-disable-next-line no-param-reassign
              delete card.coverAttachmentId;

              // eslint-disable-next-line no-param-reassign
              card.taskLists = taskLists.filter((taskList) => taskList.cardId === cardId);
            });
          }
        });

        board.labels.forEach((label) => {
          // eslint-disable-next-line no-param-reassign
          delete label.boardId;
          // eslint-disable-next-line no-param-reassign
          delete label.oldid;
          // eslint-disable-next-line no-param-reassign
          delete label.createdAt;
          // eslint-disable-next-line no-param-reassign
          delete label.updatedAt;
        });
      });
    }

    // project.isFavorite = await sails.helpers.users.isProjectFavorite(currentUser.id, project.id);

    // const projectManagers = await ProjectManager.qm.getByProjectId(project.id);

    // const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');
    // const users = await User.qm.getByIds(userIds);

    // const backgroundImages = (await BackgroundImage.qm.getByProjectId(project.id)).map((bg) =>
    //   sails.helpers.backgroundImages.presentOne(bg),
    // );
    // console.log('backgroundImages', backgroundImages);

    const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.getByProjectId(project.id);
    const baseCustomFieldGroupsIds = sails.helpers.utils.mapRecords(baseCustomFieldGroups);

    const customFields =
      await CustomField.qm.getByBaseCustomFieldGroupIds(baseCustomFieldGroupsIds);

    project.baseCustomFieldGroups = baseCustomFieldGroups.map((group) => {
      // eslint-disable-next-line no-param-reassign
      group.customFields = customFields
        .filter((field) => field.baseCustomFieldGroupId === group.id)
        .map((field) => {
          // eslint-disable-next-line no-param-reassign
          delete field.id;
          // eslint-disable-next-line no-param-reassign
          delete field.createdAt;
          // eslint-disable-next-line no-param-reassign
          delete field.updatedAt;
          // eslint-disable-next-line no-param-reassign
          delete field.baseCustomFieldGroupId;
          // eslint-disable-next-line no-param-reassign
          delete field.customFieldGroupId;
          return field;
        });

      // eslint-disable-next-line no-param-reassign
      delete group.projectId;
      // eslint-disable-next-line no-param-reassign
      delete group.createdAt;
      // eslint-disable-next-line no-param-reassign
      delete group.updatedAt;
      // eslint-disable-next-line no-param-reassign
      delete group.id;

      return group;
    });

    // let notificationServices = [];
    // if (isProjectManager) {
    //   boardIds = sails.helpers.utils.mapRecords(boards);
    //   notificationServices = await NotificationService.qm.getByBoardIds(boardIds);
    // }

    delete project.id;
    delete project.createdAt;
    delete project.updatedAt;

    return { ...project, boards };
  },
};
