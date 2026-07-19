/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// See https://www.rfc-editor.org/rfc/rfc4515 for the characters that must be escaped
// in an LDAP search filter value.
const escapeFilterValue = (value) =>
  value.replace(/[\\*()\0]/g, (char) => `\\${char.charCodeAt(0).toString(16).padStart(2, '0')}`);

const bind = (client, dn, password) =>
  new Promise((resolve, reject) => {
    client.bind(dn, password, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const unbind = (client) =>
  new Promise((resolve) => {
    client.unbind(() => resolve());
  });

const search = (client, base, options) =>
  new Promise((resolve, reject) => {
    client.search(base, options, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      const entries = [];

      response.on('searchEntry', (entry) => {
        entries.push(entry);
      });

      response.on('error', (searchError) => {
        reject(searchError);
      });

      response.on('end', (result) => {
        if (result.status !== 0) {
          reject(new Error(`LDAP search ended with status ${result.status}`));
          return;
        }

        resolve(entries);
      });
    });
  });

// Converts a ldapjs SearchResultEntry into a plain, lower-cased attribute-name -> values map
const getEntryAttributeMap = (entry) => {
  const { attributes } = entry.pojo;

  return attributes.reduce((map, { type, values }) => {
    map[type.toLowerCase()] = values; // eslint-disable-line no-param-reassign
    return map;
  }, {});
};

const getFirstAttributeValue = (attributeMap, attributeName) => {
  const values = attributeMap[attributeName.toLowerCase()];
  return values && values.length > 0 ? values[0] : undefined;
};

module.exports = {
  escapeFilterValue,
  bind,
  unbind,
  search,
  getEntryAttributeMap,
  getFirstAttributeValue,
};
