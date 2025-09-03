/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export default (url) => {
  const filename = url.split('/').pop().toLowerCase();

  let extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);
  extension = extension ? extension.toLowerCase() : null;

  return {
    filename,
    extension,
  };
};
