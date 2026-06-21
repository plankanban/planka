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
 *                 enum: [private, shared]
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

async function importProject(project, currentUser) {
  const boards = project.boards || [];

  boards.forEach(async (board) => {
    // eslint-disable-next-line no-param-reassign
    board.projectId = project.id;

    const labels = structuredClone(board.labels);
    const lists = structuredClone(board.lists);
    // eslint-disable-next-line no-param-reassign
    delete board.labels;
    // eslint-disable-next-line no-param-reassign
    delete board.lists;

    const boardResult = await sails.helpers.boards.createOne.with({
      values: {
        ...board,
        project,
      },
      actorUser: currentUser,
    });

    labels.forEach(async (label) => {
      // eslint-disable-next-line no-param-reassign
      label.boardId = boardResult.board.id;

      const l = structuredClone(label);
      delete l.id;
      const newLabel = await sails.helpers.labels.createOne.with({
        values: {
          ...l,
          board: boardResult.board,
        },
        project,
        actorUser: currentUser,
      });

      // eslint-disable-next-line no-param-reassign
      label.newid = newLabel.id;
    });

    lists
      .filter((l) => !['trash', 'archive'].includes(l.type))
      .forEach(async (list) => {
        const cards = structuredClone(list.cards) || [];

        // eslint-disable-next-line no-param-reassign
        delete list.cards;

        const listResult = await sails.helpers.lists.createOne.with({
          values: {
            ...list,
            board: boardResult.board,
          },
          project,
          actorUser: currentUser,
        });

        cards.forEach(async (card) => {
          // eslint-disable-next-line no-param-reassign
          delete card.attachments;
          const taskLists = structuredClone(card.taskLists || []);
          // eslint-disable-next-line no-param-reassign
          delete card.taskLists;
          // eslint-disable-next-line no-param-reassign
          delete card.id;

          const cardLabels = structuredClone(card.labels || []);
          // eslint-disable-next-line no-param-reassign
          delete card.labels;

          const cardResult = await sails.helpers.cards.createOne.with({
            values: {
              ...card,
              board: boardResult.board,
              list: listResult,
              creatorUser: currentUser,
            },
            project,
          });

          labels
            .filter((label) => cardLabels.includes(label.id))
            .forEach(async (label) => {
              const l = structuredClone(label);
              l.id = l.newid;

              await sails.helpers.cardLabels.createOne.with({
                values: {
                  card: cardResult,
                  label: l,
                },
                project,
                board: boardResult.board,
                list: listResult,
                actorUser: currentUser,
              });
            });

          taskLists.forEach(async (taskList) => {
            const tasks = structuredClone(taskList.tasks || []);
            // eslint-disable-next-line no-param-reassign
            delete taskList.tasks;
            // eslint-disable-next-line no-param-reassign
            delete taskList.id;

            const taskListResult = await sails.helpers.taskLists.createOne.with({
              values: {
                ...taskList,
                card: cardResult,
              },
              project,
              board: boardResult.board,
              list: listResult,

              actorUser: currentUser,
            });

            tasks.forEach(async (task) => {
              // eslint-disable-next-line no-param-reassign
              delete task.id;

              await sails.helpers.tasks.createOne.with({
                values: {
                  ...task,
                  taskList: taskListResult,
                  card: cardResult,
                },
                project,
                board: boardResult.board,
                list: listResult,
                card: cardResult,
                actorUser: currentUser,
              });
            });
          });
        });
      });
  });
}

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
    import: {
      type: {},
      allowNull: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let values = _.pick(inputs, ['type', 'name', 'description']);

    if (inputs.import && inputs.import.type === 'planka-json') {
      const projectData = structuredClone(inputs.import.data);
      delete projectData.boards;
      delete projectData.name;
      delete projectData.description;
      delete projectData.type;

      values = {
        ...values,
        ...projectData,
      };
    }

    const { project, projectManager } = await sails.helpers.projects.createOne.with({
      values,
      actorUser: currentUser,
      request: this.req,
    });

    if (inputs.import && inputs.import.type === 'planka-json') {
      const importProjectData = inputs.import.data;
      importProjectData.id = project.id;
      await importProject(importProjectData, currentUser);
    }

    return {
      item: project,
      included: {
        projectManagers: [projectManager],
      },
    };
  },
};
