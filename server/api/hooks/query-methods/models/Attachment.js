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
    const arrayOfValuesByUploadedFileId = _.groupBy(arrayOfFileValues, 'data.uploadedFileId');
    const uploadedFileIds = Object.keys(arrayOfValuesByUploadedFileId);

    const uploadedFileIdsByTotal = Object.entries(arrayOfValuesByUploadedFileId).reduce(
      (result, [uploadedFileId, arrayOfValuesItem]) => ({
        ...result,
        [arrayOfValuesItem.length]: [...(result[arrayOfValuesItem.length] || []), uploadedFileId],
      }),
      {},
    );

    return sails.getDatastore().transaction(async (db) => {
      const queryValues = [];
      let query = `UPDATE uploaded_file SET references_total = references_total + CASE `;

      Object.entries(uploadedFileIdsByTotal).forEach(([total, uploadedFileIdsItem]) => {
        const inValues = uploadedFileIdsItem.map((uploadedFileId) => {
          queryValues.push(uploadedFileId);
          return `$${queryValues.length}`;
        });

        queryValues.push(total);
        query += `WHEN id IN (${inValues.join(', ')}) THEN $${queryValues.length}::int `;
      });

      const inValues = uploadedFileIds.map((uploadedFileId) => {
        queryValues.push(uploadedFileId);
        return `$${queryValues.length}`;
      });

      queryValues.push(new Date().toISOString());
      query += `END, updated_at = $${queryValues.length} WHERE id IN (${inValues.join(', ')}) AND references_total IS NOT NULL RETURNING id`;

      const queryResult = await sails.sendNativeQuery(query, queryValues).usingConnection(db);
      const nextUploadedFileIds = sails.helpers.utils.mapRecords(queryResult.rows);

      if (nextUploadedFileIds.length < uploadedFileIds.length) {
        const nextUploadedFileIdsSet = new Set(nextUploadedFileIds);

        // eslint-disable-next-line no-param-reassign
        arrayOfValues = arrayOfValues.filter(
          (values) =>
            values.type !== Attachment.Types.FILE ||
            nextUploadedFileIdsSet.has(values.data.uploadedFileId),
        );
      }

      return Attachment.createEach(arrayOfValues).fetch().usingConnection(db);
    });
  }

  return Attachment.createEach(arrayOfValues).fetch();
};

const createOne = (values) => {
  if (values.type === Attachment.Types.FILE) {
    return sails.getDatastore().transaction(async (db) => {
      const attachment = await Attachment.create({ ...values })
        .fetch()
        .usingConnection(db);

      const queryResult = await sails
        .sendNativeQuery(
          'UPDATE uploaded_file SET references_total = references_total + 1, updated_at = $1 WHERE id = $2 AND references_total IS NOT NULL',
          [new Date().toISOString(), values.data.uploadedFileId],
        )
        .usingConnection(db);

      if (queryResult.rowCount === 0) {
        throw 'uploadedFileNotFound';
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

    let uploadedFiles = [];
    if (fileAttachments.length > 0) {
      const attachmentsByUploadedFileId = _.groupBy(fileAttachments, 'data.uploadedFileId');

      const uploadedFileIdsByTotal = Object.entries(attachmentsByUploadedFileId).reduce(
        (result, [uploadedFileId, attachmentsItem]) => ({
          ...result,
          [attachmentsItem.length]: [...(result[attachmentsItem.length] || []), uploadedFileId],
        }),
        {},
      );

      const queryValues = [];
      let query = 'UPDATE uploaded_file SET references_total = CASE WHEN references_total = CASE ';

      Object.entries(uploadedFileIdsByTotal).forEach(([total, uploadedFileIds]) => {
        const inValues = uploadedFileIds.map((uploadedFileId) => {
          queryValues.push(uploadedFileId);
          return `$${queryValues.length}`;
        });

        queryValues.push(total);
        query += `WHEN id IN (${inValues.join(', ')}) THEN $${queryValues.length}::int `;
      });

      query += 'END THEN NULL ELSE references_total - CASE ';

      Object.entries(uploadedFileIdsByTotal).forEach(([total, uploadedFileIds]) => {
        const inValues = uploadedFileIds.map((uploadedFileId) => {
          queryValues.push(uploadedFileId);
          return `$${queryValues.length}`;
        });

        queryValues.push(total);
        query += `WHEN id IN (${inValues.join(', ')}) THEN $${queryValues.length}::int `;
      });

      const inValues = Object.keys(attachmentsByUploadedFileId).map((uploadedFileId) => {
        queryValues.push(uploadedFileId);
        return `$${queryValues.length}`;
      });

      queryValues.push(new Date().toISOString());
      query += `END END, updated_at = $${queryValues.length} WHERE id IN (${inValues.join(', ')}) AND references_total IS NOT NULL RETURNING *`;

      const queryResult = await sails.sendNativeQuery(query, queryValues).usingConnection(db);

      uploadedFiles = queryResult.rows.map((row) => ({
        id: row.id,
        type: row.type,
        mimeType: row.mime_type,
        size: row.size,
        referencesTotal: row.references_total,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }

    return { attachments, uploadedFiles };
  });

const deleteOne = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const attachment = await Attachment.destroyOne(criteria).usingConnection(db);

    let uploadedFile;
    if (attachment.type === Attachment.Types.FILE) {
      const queryResult = await sails
        .sendNativeQuery(
          'UPDATE uploaded_file SET references_total = CASE WHEN references_total > 1 THEN references_total - 1 END, updated_at = $1 WHERE id = $2 RETURNING *',
          [new Date().toISOString(), attachment.data.uploadedFileId],
        )
        .usingConnection(db);

      const [row] = queryResult.rows;

      uploadedFile = {
        id: row.id,
        type: row.type,
        mimeType: row.mime_type,
        size: row.size,
        referencesTotal: row.references_total,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }

    return { attachment, uploadedFile };
  });

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
