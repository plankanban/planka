const got = require('got');

const Errors = {
  INVALID_IMPORT_FILE: {
    invalidImport: 'Invalid Import',
  },
};

module.exports = {
  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    this.req.file('file').upload(sails.helpers.downloadImportData(), async (error, files) => {
      try {
        const data = JSON.parse(files[0].extra);
        const { project, projectMembership } = await sails.helpers.createProject(
          currentUser,
          { name: data.name },
          this.req,
          true,
          false,
        );

        // Création du tableau
        const board = await sails.helpers.createBoard(
          project,
          { name: 'Premier tableau', position: 0, type: 'kanban' },
          this.req,
        );

        // Création des labels
        const labels = new Map();
        /* eslint-disable no-await-in-loop */
        // eslint-disable-next-line no-restricted-syntax
        for (const l of data.labels) {
          labels.set(
            l.id,
            await sails.helpers.createLabel(board, {
              name: l.name || '?',
              color: await sails.helpers.getColorFromTrello(l.color),
            }),
          );
        }

        // Création des listes
        const lists = new Map();
        // eslint-disable-next-line no-restricted-syntax
        for (const l of data.lists) {
          lists.set(
            l.id,
            await sails.helpers.createList(board, {
              name: l.name || '?',
              position: l.pos,
            }),
          );
        }

        // Création des cartes
        const cards = new Map();
        // eslint-disable-next-line no-restricted-syntax
        for (const c of data.cards) {
          const card = await sails.helpers.createCard(
            board,
            lists.get(c.idList),
            {
              position: Math.round(c.pos),
              name: c.name,
              description: c.desc || null,
            },
            currentUser,
            this.req,
          );
          cards.set(c.id, card);
          c.idLabels.forEach(async (l) => {
            await sails.helpers.createCardLabel(card, labels.get(l), this.req);
          });

          // eslint-disable-next-line no-restricted-syntax
          for (const a of c.attachments) {
            if (a.url.startsWith('https://trello-attachments.s3.amazonaws.com/'))
              got
                .stream(a.url)
                .pipe(sails.helpers.importAttachmentReceiver(a, card, currentUser, {}, this.req));
          }
        }

        // Création des commentaires
        const listOfComments = data.actions.filter((a) => a.type === 'commentCard');
        // eslint-disable-next-line no-restricted-syntax
        for (const comment of listOfComments) {
          const userName =
            data.members.find((u) => u.id === comment.idMemberCreator).fullName || 'Inconnu';
          await sails.helpers.createAction(
            cards.get(comment.data.card.id),
            currentUser,
            {
              type: 'commentCard',
              data: { text: `${userName} - ${comment.data.text}` },
            },
            this.req,
            false,
          );
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const listOfTask of data.checklists) {
          const card = cards.get(listOfTask.idCard);
          // eslint-disable-next-line no-restricted-syntax
          for (const task of listOfTask.checkItems) {
            await sails.helpers.createTask(
              card,
              {
                name: task.name,
                isCompleted: task.state === 'complete',
              },
              this.req,
            );
          }
        }

        sails.sockets.broadcast(
          `user:${projectMembership.userId}`,
          'projectCreate',
          {
            item: project,
            included: {
              users: [currentUser],
              projectMemberships: [projectMembership],
              boards: await sails.helpers.getBoardsForProject(project.id),
            },
          },
          this.req,
        );

        return exits.success({
          item: project,
          included: {
            users: [currentUser],
            projectMemberships: [projectMembership],
            boards: await sails.helpers.getBoardsForProject(project.id),
          },
        });
      } catch (e) {
        throw Errors.INVALID_IMPORT_FILE;
      }
    });
  },
};
