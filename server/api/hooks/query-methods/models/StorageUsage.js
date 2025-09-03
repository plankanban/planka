/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* Query methods */

const getOneMain = () => StorageUsage.findOne(StorageUsage.MAIN_ID);

module.exports = {
  getOneMain,
};
