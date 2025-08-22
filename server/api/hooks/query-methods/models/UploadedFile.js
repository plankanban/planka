/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const COLUMN_NAME_BY_TYPE = {
  [UploadedFile.Types.USER_AVATAR]: 'user_avatars',
  [UploadedFile.Types.BACKGROUND_IMAGE]: 'background_images',
  [UploadedFile.Types.ATTACHMENT]: 'attachments',
};

/* Query methods */

const createOne = (values) =>
  sails.getDatastore().transaction(async (db) => {
    const uploadedFile = await UploadedFile.create({ ...values })
      .fetch()
      .usingConnection(db);

    const columnName = COLUMN_NAME_BY_TYPE[uploadedFile.type];

    await sails
      .sendNativeQuery(
        `UPDATE storage_usage SET total = total + $1, ${columnName} = ${columnName} + $1, updated_at = $2 WHERE id = $3`,
        [uploadedFile.size, new Date().toISOString(), StorageUsage.MAIN_ID],
      )
      .usingConnection(db);

    return uploadedFile;
  });

const deleteOne = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const uploadedFile = await UploadedFile.destroyOne(criteria).usingConnection(db);
    const columnName = COLUMN_NAME_BY_TYPE[uploadedFile.type];

    await sails
      .sendNativeQuery(
        `UPDATE storage_usage SET total = total - $1, ${columnName} = ${columnName} - $1, updated_at = $2 WHERE id = $3`,
        [uploadedFile.size, new Date().toISOString(), StorageUsage.MAIN_ID],
      )
      .usingConnection(db);

    return uploadedFile;
  });

module.exports = {
  createOne,
  deleteOne,
};
