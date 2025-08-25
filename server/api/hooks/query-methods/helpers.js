/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const makeWhereQueryBuilder = (Model) => (criteria) => {
  if (_.isPlainObject(criteria)) {
    if (Object.keys(criteria).length === 0) {
      throw new Error('Empty criteria');
    }

    const parts = [];
    const values = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(criteria)) {
      // eslint-disable-next-line no-underscore-dangle
      const columnName = Model._transformer._transformations[key];

      if (!columnName) {
        throw new Error('Unknown column');
      }

      values.push(value);
      parts.push(`${columnName} = $${values.length}`);
    }

    return [parts.join(' AND '), values];
  }

  return ['id = $1', [criteria]];
};

module.exports = {
  makeWhereQueryBuilder,
};
