/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const QUERY_PARTS_REGEX = /[ ,;]+/;

const buildQueryParts = (query) =>
  query.split(QUERY_PARTS_REGEX).flatMap((queryPart) => {
    if (!queryPart) {
      return [];
    }

    return queryPart.toLowerCase();
  });

module.exports = buildQueryParts;
