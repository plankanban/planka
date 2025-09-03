/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* Query methods */

const getOneMain = () => Config.findOne(Config.MAIN_ID);

const updateOneMain = (values) => Config.updateOne(Config.MAIN_ID).set({ ...values });

module.exports = {
  getOneMain,
  updateOneMain,
};
