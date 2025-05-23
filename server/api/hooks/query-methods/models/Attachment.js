/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// TODO: refactor?

const defaultFind = (criteria) => Attachment.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => {
  const arrayOfFileValues = arrayOfValues.filter(({ type }) => type === Attachment.Types.FILE);

  if (arrayOfFileValues.length > 0) {
    const arrayOfValuesByFileReferenceId = _.groupBy(arrayOfFileValues, 'data.fileReferenceId');

    const fileReferenceIds = Object.keys(arrayOfValuesByFileReferenceId);

    const fileReferenceIdsByTotal = Object.entries(arrayOfValuesByFileReferenceId).reduce(
      (result, [fileReferenceId, arrayOfValuesItem]) => ({
        ...result,
        [arrayOfValuesItem.length]: [...(result[arrayOfValuesItem.length] || []), fileReferenceId],
      }),
      {},
    );

    return sails.getDatastore().transaction(async (db) => {
      const queryValues = [];
      let query = `UPDATE file_reference SET total = total + CASE `;

      Object.entries(fileReferenceIdsByTotal).forEach(([total, fileReferenceIdsItem]) => {
        const inValues = fileReferenceIdsItem.map((fileReferenceId) => {
          queryValues.push(fileReferenceId);
          return `$${queryValues.length}`;
        });

        queryValues.push(total);
        query += `WHEN id IN (${inValues.join(', ')}) THEN $${queryValues.length}::int `;
      });

      const inValues = fileReferenceIds.map((fileReferenceId) => {
        queryValues.push(fileReferenceId);
        return `$${queryValues.length}`;
      });

      queryValues.push(new Date().toISOString());
      query += `END, updated_at = $${queryValues.length} WHERE id IN (${inValues.join(', ')}) AND total IS NOT NULL RETURNING id`;

      const queryResult = await sails.sendNativeQuery(query, queryValues).usingConnection(db);
      const nextFileReferenceIds = sails.helpers.utils.mapRecords(queryResult.rows);

      if (nextFileReferenceIds.length < fileReferenceIds.length) {
        const nextFileReferenceIdsSet = new Set(nextFileReferenceIds);

        // eslint-disable-next-line no-param-reassign
        arrayOfValues = arrayOfValues.filter(
          (values) =>
            values.type !== Attachment.Types.FILE ||
            nextFileReferenceIdsSet.has(values.data.fileReferenceId),
        );
      }

      return Attachment.createEach(arrayOfValues).fetch().usingConnection(db);
    });
  }

  return Attachment.createEach(arrayOfValues).fetch();
};

const createOne = (values) => {
  if (values.type === Attachment.Types.FILE) {
    const { fileReferenceId } = values.data;

    return sails.getDatastore().transaction(async (db) => {
      const attachment = await Attachment.create({ ...values })
        .fetch()
        .usingConnection(db);

      const queryResult = await sails
        .sendNativeQuery(
          'UPDATE file_reference SET total = total + 1, updated_at = $1 WHERE id = $2 AND total IS NOT NULL',
          [new Date().toISOString(), fileReferenceId],
        )
        .usingConnection(db);

      if (queryResult.rowCount === 0) {
        throw 'fileReferenceNotFound';
      }

      return attachment;
    });
  }

  return Attachment.create({ ...values }).fetch();
};

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId) =>
  defaultFind({
    cardId,
  });

const getByCardIds = (cardIds) =>
  defaultFind({
    cardId: cardIds,
  });

const getOneById = (id, { cardId } = {}) => {
  const criteria = {
    id,
  };

  if (cardId) {
    criteria.cardId = cardId;
  }

  return Attachment.findOne(criteria);
};

const update = (criteria, values) => Attachment.update(criteria).set(values).fetch();

const updateOne = (criteria, values) => Attachment.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const attachments = await Attachment.destroy(criteria).fetch().usingConnection(db);
    const fileAttachments = attachments.filter(({ type }) => type === Attachment.Types.FILE);

    let fileReferences = [];
    if (fileAttachments.length > 0) {
      const attachmentsByFileReferenceId = _.groupBy(fileAttachments, 'data.fileReferenceId');

      const fileReferenceIdsByTotal = Object.entries(attachmentsByFileReferenceId).reduce(
        (result, [fileReferenceId, attachmentsItem]) => ({
          ...result,
          [attachmentsItem.length]: [...(result[attachmentsItem.length] || []), fileReferenceId],
        }),
        {},
      );

      const queryValues = [];
      let query = 'UPDATE file_reference SET total = CASE WHEN total = CASE ';

      Object.entries(fileReferenceIdsByTotal).forEach(([total, fileReferenceIds]) => {
        const inValues = fileReferenceIds.map((fileReferenceId) => {
          queryValues.push(fileReferenceId);
          return `$${queryValues.length}`;
        });

        queryValues.push(total);
        query += `WHEN id IN (${inValues.join(', ')}) THEN $${queryValues.length}::int `;
      });

      query += 'END THEN NULL ELSE total - CASE ';

      Object.entries(fileReferenceIdsByTotal).forEach(([total, fileReferenceIds]) => {
        const inValues = fileReferenceIds.map((fileReferenceId) => {
          queryValues.push(fileReferenceId);
          return `$${queryValues.length}`;
        });

        queryValues.push(total);
        query += `WHEN id IN (${inValues.join(', ')}) THEN $${queryValues.length}::int `;
      });

      const inValues = Object.keys(attachmentsByFileReferenceId).map((fileReferenceId) => {
        queryValues.push(fileReferenceId);
        return `$${queryValues.length}`;
      });

      queryValues.push(new Date().toISOString());
      query += `END END, updated_at = $${queryValues.length} WHERE id IN (${inValues.join(', ')}) AND total IS NOT NULL RETURNING id, total`;

      const queryResult = await sails.sendNativeQuery(query, queryValues).usingConnection(db);
      fileReferences = queryResult.rows;
    }

    return {
      attachments,
      fileReferences,
    };
  });

const deleteOne = async (criteria, { isFile } = {}) => {
  let fileReference = null;

  if (isFile) {
    return sails.getDatastore().transaction(async (db) => {
      const attachment = await Attachment.destroyOne(criteria).usingConnection(db);

      if (attachment.type === Attachment.Types.FILE) {
        const queryResult = await sails
          .sendNativeQuery(
            'UPDATE file_reference SET total = CASE WHEN total > 1 THEN total - 1 END, updated_at = $1 WHERE id = $2 RETURNING id, total',
            [new Date().toISOString(), attachment.data.fileReferenceId],
          )
          .usingConnection(db);

        [fileReference] = queryResult.rows;
      }

      return {
        attachment,
        fileReference,
      };
    });
  }

  const attachment = await Attachment.destroyOne(criteria);

  return {
    attachment,
    fileReference,
  };
};

module.exports = {
  create,
  createOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getOneById,
  update,
  updateOne,
  deleteOne,
  delete: delete_,
};
