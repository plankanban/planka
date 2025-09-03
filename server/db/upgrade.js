/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

const { getEncoding } = require('istextorbinary');
const mime = require('mime');
const uuid = require('uuid');
const sharp = require('sharp');
const initKnex = require('knex');
const sails = require('sails');
const rc = require('sails/accessible/rc');
const _ = require('lodash');

const knexfile = require('./knexfile');
const { MAX_SIZE_TO_GET_ENCODING, POSITION_GAP } = require('../constants');

const PrevActionTypes = {
  COMMENT_CARD: 'commentCard',
};

const PROJECT_BACKGROUND_IMAGES_PATH_SEGMENT = 'public/project-background-images';

const readStreamToBuffer = (readStream) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    readStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    readStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    readStream.on('error', (error) => {
      reject(error);
    });
  });

const loadSails = () =>
  new Promise((resolve) => {
    sails.load(
      {
        ...rc('sails'),
        log: {
          level: 'error',
        },
      },
      resolve,
    );
  });

const runStep = async (label, func) => {
  process.stdout.write(`${label}... `);

  try {
    await func();
    console.log('[OK]');
  } catch (error) {
    console.log('[FAIL]');
    throw error;
  }
};

const knex = initKnex(knexfile);

const upgradeDatabase = async () => {
  await knex.transaction(async (trx) => {
    await trx.raw(`
      CREATE SCHEMA v1;

      ALTER SEQUENCE next_id_seq SET SCHEMA v1;
      ALTER FUNCTION next_id(OUT id BIGINT) SET SCHEMA v1;

      ALTER TABLE migration SET SCHEMA v1;
      ALTER TABLE migration_lock SET SCHEMA v1;
      ALTER TABLE archive SET SCHEMA v1;
      ALTER TABLE user_account SET SCHEMA v1;
      ALTER TABLE identity_provider_user SET SCHEMA v1;
      ALTER TABLE session SET SCHEMA v1;
      ALTER TABLE project SET SCHEMA v1;
      ALTER TABLE project_manager SET SCHEMA v1;
      ALTER TABLE board SET SCHEMA v1;
      ALTER TABLE board_membership SET SCHEMA v1;
      ALTER TABLE label SET SCHEMA v1;
      ALTER TABLE list SET SCHEMA v1;
      ALTER TABLE card SET SCHEMA v1;
      ALTER TABLE card_subscription SET SCHEMA v1;
      ALTER TABLE card_membership SET SCHEMA v1;
      ALTER TABLE card_label SET SCHEMA v1;
      ALTER TABLE task SET SCHEMA v1;
      ALTER TABLE attachment SET SCHEMA v1;
      ALTER TABLE action SET SCHEMA v1;
      ALTER TABLE notification SET SCHEMA v1;
    `);

    await trx.migrate.up({
      name: '20250228000022_version_2.js',
    });

    const users = await trx('user_account').withSchema('v1').whereNull('deleted_at');

    const userIds = users.map(({ id }) => id);
    const userIdsSet = new Set(userIds);
    const whereInUserIds = ['0', ...userIds];

    if (users.length > 0) {
      await knex
        .batchInsert(
          'user_account',
          users.map((user) => ({
            ..._.pick(user, [
              'id',
              'email',
              'password',
              'name',
              'username',
              'phone',
              'organization',
              'language',
              'subscribe_to_own_cards',
              'created_at',
              'updated_at',
              'password_changed_at',
            ]),
            role: user.is_admin ? User.Roles.ADMIN : User.Roles.BOARD_USER,
            avatar: user.avatar && {
              ...user.avatar,
              sizeInBytes: 0,
            },
            subscribe_to_card_when_commenting: true,
            turn_off_recent_card_highlighting: false,
            enable_favorites_by_default: false,
            default_editor_mode: User.EditorModes.WYSIWYG,
            default_home_view: User.HomeViews.GROUPED_PROJECTS,
            default_projects_order: User.ProjectOrders.BY_DEFAULT,
            is_sso_user: user.is_sso,
            is_deactivated: false,
          })),
        )
        .transacting(trx);

      const identityProviderUsers = await trx('identity_provider_user')
        .withSchema('v1')
        .whereRaw('user_id = ANY (?)', [whereInUserIds]);

      if (identityProviderUsers.length > 0) {
        await knex.batchInsert('identity_provider_user', identityProviderUsers).transacting(trx);
      }

      const sessions = await trx('session')
        .withSchema('v1')
        .whereRaw('user_id = ANY (?)', [whereInUserIds]);

      if (sessions.length > 0) {
        await knex.batchInsert('session', sessions).transacting(trx);
      }
    }

    const projects = await trx('project').withSchema('v1');
    const whereInProjectIds = ['0', ...projects.map(({ id }) => id)];

    if (projects.length > 0) {
      const projectsWithBackgroundImage = projects.filter((project) => project.background_image);

      const backgroundImageIdByProjectId = {};
      if (projectsWithBackgroundImage.length > 0) {
        const createdAt = new Date().toISOString();

        const backgroundImages = await knex
          .batchInsert(
            'background_image',
            projectsWithBackgroundImage.map((project) => ({
              ...project.background_image,
              project_id: project.id,
              size_in_bytes: 0,
              created_at: createdAt,
            })),
          )
          .returning(['id', 'project_id'])
          .transacting(trx);

        backgroundImages.forEach((backgroundImage) => {
          backgroundImageIdByProjectId[backgroundImage.project_id] = backgroundImage.id;
        });
      }

      await knex
        .batchInsert(
          'project',
          projects.map((project) => {
            const data = {
              ..._.pick(project, ['id', 'name', 'created_at', 'updated_at']),
              is_hidden: false,
            };

            if (project.background) {
              data.background_type = project.background.type;

              switch (project.background.type) {
                case Project.BackgroundTypes.GRADIENT:
                  data.background_gradient = project.background.name;

                  break;
                case Project.BackgroundTypes.IMAGE:
                  data.background_image_id = backgroundImageIdByProjectId[project.id];

                  break;
                default:
              }
            }

            return data;
          }),
        )
        .transacting(trx);
    }

    const projectManagers = await trx('project_manager')
      .withSchema('v1')
      .whereRaw('project_id = ANY (?)', [whereInProjectIds]);

    if (projectManagers.length > 0) {
      await knex.batchInsert('project_manager', projectManagers).transacting(trx);
    }

    const boards = await trx('board')
      .withSchema('v1')
      .whereRaw('project_id = ANY (?)', [whereInProjectIds]);

    const projectIdByBoardId = boards.reduce(
      (result, board) => ({
        ...result,
        [board.id]: board.project_id,
      }),
      {},
    );

    const whereInBoardIds = ['0', ...Object.keys(projectIdByBoardId)];

    if (boards.length > 0) {
      await knex
        .batchInsert(
          'board',
          boards.map((board) => ({
            ..._.pick(board, ['id', 'project_id', 'position', 'name', 'created_at', 'updated_at']),
            default_view: Board.Views.KANBAN,
            default_card_type: Card.Types.PROJECT,
            limit_card_types_to_default_one: false,
            always_display_card_creator: false,
          })),
        )
        .transacting(trx);

      const createdAt = new Date().toISOString();

      await knex
        .batchInsert(
          'list',
          boards.flatMap((board) =>
            [List.Types.ARCHIVE, List.Types.TRASH].map((type) => ({
              type,
              board_id: board.id,
              created_at: createdAt,
            })),
          ),
        )
        .transacting(trx);
    }

    const boardMemberships = await trx('board_membership')
      .withSchema('v1')
      .whereRaw('board_id = ANY (?)', [whereInBoardIds]);

    if (boardMemberships.length > 0) {
      await knex
        .batchInsert(
          'board_membership',
          boardMemberships.map((boardMembership) => ({
            ..._.pick(boardMembership, [
              'id',
              'board_id',
              'user_id',
              'role',
              'can_comment',
              'created_at',
              'updated_at',
            ]),
            project_id: projectIdByBoardId[boardMembership.board_id],
          })),
        )
        .transacting(trx);
    }

    const labels = await trx('label')
      .withSchema('v1')
      .whereRaw('board_id = ANY (?)', [whereInBoardIds]);

    if (labels.length > 0) {
      await knex.batchInsert('label', labels).transacting(trx);
    }

    const lists = await trx('list')
      .withSchema('v1')
      .whereRaw('board_id = ANY (?)', [whereInBoardIds]);

    const whereInListIds = ['0', ...lists.map(({ id }) => id)];

    if (lists.length > 0) {
      await knex
        .batchInsert(
          'list',
          lists.map((list) => ({
            ..._.pick(list, [
              'id',
              'board_id',
              'position',
              'name',
              'color',
              'created_at',
              'updated_at',
            ]),
            type: List.Types.ACTIVE,
          })),
        )
        .transacting(trx);
    }

    const cards = await trx('card')
      .withSchema('v1')
      .whereRaw('board_id = ANY (?)', [whereInBoardIds])
      .whereRaw('list_id = ANY (?)', [whereInListIds]);

    const cardById = _.keyBy(cards, 'id');
    const whereInCardIds = ['0', ...Object.keys(cardById)];

    if (cards.length > 0) {
      await knex
        .batchInsert(
          'card',
          cards.map((card) => ({
            ..._.pick(card, [
              'id',
              'board_id',
              'list_id',
              'cover_attachment_id',
              'position',
              'name',
              'description',
              'due_date',
              'stopwatch',
              'created_at',
              'updated_at',
            ]),
            creator_user_id: userIdsSet.has(card.creator_user_id) ? card.creator_user_id : null,
            type: Card.Types.PROJECT,
            list_changed_at: card.created_at,
          })),
        )
        .transacting(trx);
    }

    const cardSubscriptions = await trx('card_subscription')
      .withSchema('v1')
      .whereRaw('card_id = ANY (?)', [whereInCardIds]);

    if (cardSubscriptions.length > 0) {
      await knex.batchInsert('card_subscription', cardSubscriptions).transacting(trx);
    }

    const cardMemberships = await trx('card_membership')
      .withSchema('v1')
      .whereRaw('card_id = ANY (?)', [whereInCardIds]);

    if (cardMemberships.length > 0) {
      await knex.batchInsert('card_membership', cardMemberships).transacting(trx);
    }

    const cardLabels = await trx('card_label')
      .withSchema('v1')
      .whereRaw('card_id = ANY (?)', [whereInCardIds]);

    if (cardLabels.length > 0) {
      await knex.batchInsert('card_label', cardLabels).transacting(trx);
    }

    const tasks = await trx('task')
      .withSchema('v1')
      .whereRaw('card_id = ANY (?)', [whereInCardIds]);

    const tasksByCardId = _.groupBy(tasks, 'card_id');
    const taskCardIds = Object.keys(tasksByCardId);

    if (taskCardIds.length > 0) {
      const createdAt = new Date().toISOString();

      const taskLists = await knex
        .batchInsert(
          'task_list',
          taskCardIds.map((cardId) => ({
            card_id: cardId,
            position: POSITION_GAP,
            name: 'Task List',
            show_on_front_of_card: true,
            created_at: createdAt,
          })),
        )
        .returning(['id', 'card_id'])
        .transacting(trx);

      await knex
        .batchInsert(
          'task',
          taskLists.flatMap((taskList) =>
            tasksByCardId[taskList.card_id].map((task) => ({
              ..._.pick(task, [
                'id',
                'position',
                'name',
                'is_completed',
                'created_at',
                'updated_at',
              ]),
              task_list_id: taskList.id,
            })),
          ),
        )
        .transacting(trx);
    }

    const attachments = await trx('attachment')
      .withSchema('v1')
      .whereRaw('card_id = ANY (?)', [whereInCardIds]);

    if (attachments.length > 0) {
      await knex
        .batchInsert(
          'attachment',
          attachments.map((attachment) => ({
            ..._.pick(attachment, ['id', 'card_id', 'name', 'created_at', 'updated_at']),
            creator_user_id: userIdsSet.has(attachment.creator_user_id)
              ? attachment.creator_user_id
              : null,
            type: Attachment.Types.FILE,
            data: {
              fileReferenceId: attachment.dirname,
              filename: attachment.filename,
              mimeType: mime.getType(attachment.filename),
              sizeInBytes: 0,
              encoding: null,
              image: attachment.image,
            },
          })),
        )
        .transacting(trx);
    }

    const actions = await trx('action')
      .withSchema('v1')
      .whereRaw('card_id = ANY (?)', [whereInCardIds]);

    const actionById = _.keyBy(actions, 'id');
    const whereInActionIds = ['0', ...Object.keys(actionById)];

    const commentActions = [];
    const otherActions = [];

    actions.forEach((action) => {
      if (action.type === PrevActionTypes.COMMENT_CARD) {
        commentActions.push(action);
      } else {
        otherActions.push(action);
      }
    });

    if (commentActions.length > 0) {
      await knex
        .batchInsert(
          'comment',
          commentActions.map((action) => ({
            ..._.pick(action, ['id', 'card_id', 'created_at', 'updated_at']),
            user_id: userIdsSet.has(action.user_id) ? action.user_id : null,
            text: action.data.text,
          })),
        )
        .transacting(trx);
    }

    if (otherActions.length > 0) {
      await knex
        .batchInsert(
          'action',
          otherActions.map((action) => {
            const data = {
              ..._.pick(action, ['id', 'card_id', 'type', 'created_at', 'updated_at']),
              user_id: userIdsSet.has(action.user_id) ? action.user_id : null,
            };

            switch (action.type) {
              case Action.Types.CREATE_CARD:
                data.data = {
                  list: {
                    ...action.data.list,
                    type: List.Types.ACTIVE,
                  },
                };

                break;
              case Action.Types.MOVE_CARD:
                data.data = {
                  fromList: {
                    ...action.data.fromList,
                    type: List.Types.ACTIVE,
                  },
                  toList: {
                    ...action.data.toList,
                    type: List.Types.ACTIVE,
                  },
                };

                break;
              default:
            }

            return data;
          }),
        )
        .transacting(trx);
    }

    const notifications = await trx('notification')
      .withSchema('v1')
      .whereRaw('user_id = ANY (?)', [whereInUserIds])
      .whereRaw('action_id = ANY (?)', [whereInActionIds])
      .whereRaw('card_id = ANY (?)', [whereInCardIds]);

    if (notifications.length > 0) {
      await knex
        .batchInsert(
          'notification',
          notifications.map((notification) => {
            const card = cardById[notification.card_id];
            const action = actionById[notification.action_id];

            const data = {
              ..._.pick(notification, [
                'id',
                'user_id',
                'card_id',
                'is_read',
                'created_at',
                'updated_at',
              ]),
              creator_user_id: userIdsSet.has(action.user_id) ? action.user_id : null,
              board_id: card.board_id,
              type: action.type,
            };

            if (action.type === PrevActionTypes.COMMENT_CARD) {
              Object.assign(data, {
                comment_id: action.id,
                data: {
                  card: _.pick(card, ['name']),
                  text: action.data.text,
                },
              });
            } else {
              Object.assign(data, {
                action_id: action.id,
                data: {
                  fromList: {
                    ...action.data.fromList,
                    type: List.Types.ACTIVE,
                  },
                  toList: {
                    ...action.data.toList,
                    type: List.Types.ACTIVE,
                  },
                  card: _.pick(card, ['name']),
                },
              });
            }

            return data;
          }),
        )
        .transacting(trx);
    }

    await trx.schema.dropSchema('v1', true);
  });
};

const upgradeUserAvatars = async () => {
  const fileManager = sails.hooks['file-manager'].getInstance();

  const dirnames = await fileManager.listDir(sails.config.custom.userAvatarsPathSegment);
  const users = await knex('user_account').whereNotNull('avatar');

  if (dirnames) {
    const userByDirname = _.keyBy(users, 'avatar.dirname');

    for (const dirname of dirnames) {
      const user = userByDirname[dirname];
      const dirPathSegment = `${sails.config.custom.userAvatarsPathSegment}/${dirname}`;

      if (user) {
        const size = await fileManager.getSize(
          `${dirPathSegment}/original.${user.avatar.extension}`,
        );

        await knex('user_account')
          .update({
            avatar: knex.raw("?? || jsonb_build_object('sizeInBytes', ?::bigint)", [
              'avatar',
              size,
            ]),
          })
          .where('id', user.id);
      } else {
        await fileManager.deleteDir(dirPathSegment);
      }
    }
  }

  for (const { avatar } of users) {
    const dirPathSegment = `${sails.config.custom.userAvatarsPathSegment}/${avatar.dirname}`;

    const isExists = await fileManager.isExists(`${dirPathSegment}/cover-180.${avatar.extension}`);

    if (isExists) {
      continue;
    }

    await fileManager.delete(`${dirPathSegment}/square-100.${avatar.extension}`);

    let readStream;
    try {
      readStream = await fileManager.read(`${dirPathSegment}/original.${avatar.extension}`);
    } catch (error) {
      continue;
    }

    const originalBuffer = await readStreamToBuffer(readStream);

    const image = sharp(originalBuffer, {
      animated: true,
    });

    const cover180Buffer = await image
      .resize(180, 180, {
        withoutEnlargement: true,
      })
      .png({
        quality: 75,
        force: false,
      })
      .toBuffer();

    await fileManager.save(
      `${dirPathSegment}/cover-180.${avatar.extension}`,
      cover180Buffer,
      mime.getType(avatar.extension),
    );
  }
};

const upgradeBackgroundImages = async () => {
  const fileManager = sails.hooks['file-manager'].getInstance();

  await fileManager.renameDir(
    PROJECT_BACKGROUND_IMAGES_PATH_SEGMENT,
    sails.config.custom.backgroundImagesPathSegment,
  );

  const dirnames = await fileManager.listDir(sails.config.custom.backgroundImagesPathSegment);
  const backgroundImages = await knex('background_image');

  if (dirnames) {
    const backgroundImageByDirname = _.keyBy(backgroundImages, 'dirname');

    for (const dirname of dirnames) {
      const backgroundImage = backgroundImageByDirname[dirname];
      const dirPathSegment = `${sails.config.custom.backgroundImagesPathSegment}/${dirname}`;

      if (backgroundImage) {
        const size = await fileManager.getSize(
          `${dirPathSegment}/original.${backgroundImage.extension}`,
        );

        await knex('background_image')
          .update({
            size_in_bytes: size,
          })
          .where('id', backgroundImage.id);
      } else {
        await fileManager.deleteDir(dirPathSegment);
      }
    }
  }

  for (const backgroundImage of backgroundImages) {
    const dirPathSegment = `${sails.config.custom.backgroundImagesPathSegment}/${backgroundImage.dirname}`;

    const isExists = await fileManager.isExists(
      `${dirPathSegment}/outside-360.${backgroundImage.extension}`,
    );

    if (isExists) {
      continue;
    }

    await fileManager.delete(`${dirPathSegment}/cover-336.${backgroundImage.extension}`);

    let readStream;
    try {
      readStream = await fileManager.read(
        `${dirPathSegment}/original.${backgroundImage.extension}`,
      );
    } catch (error) {
      continue;
    }

    const originalBuffer = await readStreamToBuffer(readStream);

    const image = sharp(originalBuffer, {
      animated: true,
    });

    const outside360Buffer = await image
      .resize(360, 360, {
        fit: 'outside',
        withoutEnlargement: true,
      })
      .png({
        quality: 75,
        force: false,
      })
      .toBuffer();

    await fileManager.save(
      `${dirPathSegment}/outside-360.${backgroundImage.extension}`,
      outside360Buffer,
      mime.getType(backgroundImage.extension),
    );
  }
};

const upgradeFileAttachments = async () => {
  const fileManager = sails.hooks['file-manager'].getInstance();

  const dirnames = await fileManager.listDir(sails.config.custom.attachmentsPathSegment);
  const attachments = await knex('attachment').where('type', Attachment.Types.FILE);

  const fileReferenceIds = [];
  if (dirnames) {
    const attachmentByDirname = _.keyBy(attachments, 'data.fileReferenceId');

    for (const dirname of dirnames) {
      const attachment = attachmentByDirname[dirname];
      const dirPathSegment = `${sails.config.custom.attachmentsPathSegment}/${dirname}`;

      if (attachment) {
        if (uuid.validate(dirname)) {
          const fileReferenceId = await knex.transaction(async (trx) => {
            const [{ id }] = await trx('file_reference').insert(
              {
                total: 1,
                created_at: new Date().toISOString(),
              },
              'id',
            );

            const size = await fileManager.getSize(`${dirPathSegment}/${attachment.data.filename}`);

            let encoding = null;
            if (size && size <= MAX_SIZE_TO_GET_ENCODING) {
              const readStream = await fileManager.read(
                `${dirPathSegment}/${attachment.data.filename}`,
              );

              const buffer = await readStreamToBuffer(readStream);
              encoding = getEncoding(buffer);
            }

            await trx('attachment')
              .update({
                data: trx.raw(
                  "?? || jsonb_build_object('fileReferenceId', ?::text, 'sizeInBytes', ?::bigint, 'encoding', ?::text)",
                  ['data', id, size, encoding],
                ),
              })
              .where('id', attachment.id);

            await fileManager.renameDir(
              `${dirPathSegment}`,
              `${sails.config.custom.attachmentsPathSegment}/${id}`,
            );

            return id;
          });

          fileReferenceIds.push(fileReferenceId);
        } else {
          fileReferenceIds.push(dirname);
        }
      } else {
        await fileManager.deleteDir(dirPathSegment);
      }
    }
  }

  if (fileReferenceIds.length > 0) {
    await knex('attachment')
      .update({
        data: knex.raw('?? || \'{"fileReferenceId":null}\'', 'data'),
      })
      .where('type', Attachment.Types.FILE)
      .whereRaw(`??->>'fileReferenceId' NOT IN (${fileReferenceIds.map(() => '?').join(', ')})`, [
        'data',
        ...fileReferenceIds,
      ]);
  }

  const imageAttachments = await knex('attachment')
    .where('type', Attachment.Types.FILE)
    .whereRaw("??->>'image' IS NOT NULL", 'data');

  for (const { data } of imageAttachments) {
    const dirPathSegment = `${sails.config.custom.attachmentsPathSegment}/${data.fileReferenceId}`;
    const thumbnailsPathSegment = `${dirPathSegment}/thumbnails`;

    const isExists = await fileManager.isExists(
      `${thumbnailsPathSegment}/outside-720.${data.image.thumbnailsExtension}`,
    );

    if (isExists) {
      continue;
    }

    await fileManager.deleteDir(thumbnailsPathSegment);

    let readStream;
    try {
      readStream = await fileManager.read(`${dirPathSegment}/${data.filename}`);
    } catch (error) {
      continue;
    }

    const buffer = await readStreamToBuffer(readStream);

    const image = sharp(buffer, {
      animated: true,
    });

    const outside360Buffer = await image
      .resize(360, 360, {
        fit: 'outside',
        withoutEnlargement: true,
      })
      .png({
        quality: 75,
        force: false,
      })
      .toBuffer();

    await fileManager.save(
      `${thumbnailsPathSegment}/outside-360.${data.image.thumbnailsExtension}`,
      outside360Buffer,
      data.mimeType,
    );

    const outside720Buffer = await image
      .resize(720, 720, {
        fit: 'outside',
        withoutEnlargement: true,
      })
      .png({
        quality: 75,
        force: false,
      })
      .toBuffer();

    await fileManager.save(
      `${thumbnailsPathSegment}/outside-720.${data.image.thumbnailsExtension}`,
      outside720Buffer,
      data.mimeType,
    );
  }
};

(async () => {
  try {
    let migrations;
    try {
      migrations = await knex('migration').orderBy('id');
    } catch (error) {
      throw new Error('Nothing to upgrade');
    }

    const migrationNames = migrations.map(({ name }) => name);

    const isV1 = migrationNames[0] === '20180721020022_create_next_id_function.js';
    const isLatestV1 = migrationNames.at(-1) === '20250131202710_add_list_color.js';

    if (isV1 && !isLatestV1) {
      throw new Error('Update to latest v1 first');
    }

    await loadSails();

    if (isV1) {
      await runStep('Upgrading database', upgradeDatabase);
    }

    await runStep('Upgrading user avatars', upgradeUserAvatars);
    await runStep('Upgrading background images', upgradeBackgroundImages);
    await runStep('Upgrading file attachments', upgradeFileAttachments);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    knex.destroy();
    process.exit();
  }
})();
