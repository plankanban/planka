/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
export default (array, getKey) => {
  const uniqueMap = new Map(array.map((item) => [getKey(item), item]));
  return [...uniqueMap.values()];
};
