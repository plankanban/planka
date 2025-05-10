/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';

/* Actions */

const getConfig = (headers) => http.get('/config', undefined, headers);

export default {
  getConfig,
};
