/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = async function isAuthenticated(req, res, proceed) {
  if (req.currentUser.role !== User.Roles.ADMIN) {
    return res.notFound(); // Forbidden
  }

  return proceed();
};
