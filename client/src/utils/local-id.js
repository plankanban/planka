/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

let lastTimestamp = 0;
let sequence = 0;

export const createLocalId = () => {
  const timestamp = Date.now();

  sequence = timestamp <= lastTimestamp ? sequence + 1 : 0;
  lastTimestamp = timestamp;

  return `local:${timestamp}-${String(sequence).padStart(4, '0')}`;
};

export const isLocalId = (id) => id.startsWith('local:');
