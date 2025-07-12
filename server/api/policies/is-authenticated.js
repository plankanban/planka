/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');

const API_KEY_HEADER = 'x-api-key';

module.exports = async function isAuthenticated(req, res, proceed) {
  if (req.currentUser) return proceed();

  const apiKeyHeader = req.headers[API_KEY_HEADER.toLowerCase()];
  if (!apiKeyHeader) {
    return res.unauthorized('Access token is missing, invalid or expired');
  }

  if (!apiKeyHeader.includes('.')) return res.unauthorized('Invalid API key');

  const [prefix] = apiKeyHeader.split('.');
  if (!prefix) return res.unauthorized('Invalid API key');

  const user = await User.findOne({ apiKeyPrefix: prefix, apiKeyHash: { '!=': null } });
  if (!user) return res.unauthorized('Invalid API key');

  const isMatch = await bcrypt.compare(apiKeyHeader, user.apiKeyHash);
  if (!isMatch) return res.unauthorized('Invalid API key');

  req.currentUser = user;
  return proceed();
};
