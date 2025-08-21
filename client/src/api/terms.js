/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';

/* Actions */

const getTerms = (type, language, headers) =>
  http.get(`/terms/${type}${language ? `?language=${language}` : ''}`, undefined, headers);

export default {
  getTerms,
};
