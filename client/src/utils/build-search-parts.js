/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const SEARCH_PARTS_REGEX = /[ ,;]+/; // TODO: move to utils

export default (search) =>
  search.split(SEARCH_PARTS_REGEX).flatMap((searchPart) => {
    if (!searchPart) {
      return [];
    }

    return searchPart.toLowerCase();
  });
