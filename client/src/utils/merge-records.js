/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const mergeRecords = (target, ...sources) => {
  if (sources.length === 0) {
    return target;
  }

  const source = sources.shift();

  if (!target || !source) {
    return mergeRecords(target || source, ...sources);
  }

  const nextTarget = [...target];

  source.forEach((sourceRecord) => {
    const index = nextTarget.findIndex((targetRecord) => targetRecord.id === sourceRecord.id);

    if (index >= 0) {
      Object.assign(nextTarget[index], sourceRecord);
    } else {
      nextTarget.push(sourceRecord);
    }
  });

  return mergeRecords(nextTarget, ...sources);
};

export default mergeRecords;
