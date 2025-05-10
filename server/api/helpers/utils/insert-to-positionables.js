/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const GAP = 2 ** 14;
const MIN_GAP = 0.125;
const MAX_POSITION = 2 ** 50;

const findBeginnings = (positions) => {
  positions.unshift(0);

  let prevPosition = positions.pop();
  const beginnings = [prevPosition];

  // eslint-disable-next-line consistent-return
  _.forEachRight(positions, (position) => {
    if (prevPosition - MIN_GAP >= position) {
      return false;
    }

    prevPosition = position;
    beginnings.unshift(prevPosition);
  });

  return beginnings;
};

const getRepositionsMap = (positions) => {
  const repositionsMap = {};

  if (positions.length <= 1) {
    if (!_.isUndefined(positions[0]) && positions[0] > MAX_POSITION) {
      return null;
    }

    return repositionsMap;
  }

  let prevPosition = positions.shift();

  for (let i = 0; i < positions.length; i += 1) {
    const position = positions[i];
    const nextPosition = positions[i + 1];

    if (prevPosition + MIN_GAP <= position) {
      break;
    }

    if (!_.isUndefined(nextPosition) && prevPosition + MIN_GAP * 2 <= nextPosition) {
      (repositionsMap[position] || (repositionsMap[position] = [])).push(
        prevPosition + (nextPosition - prevPosition) / 2,
      );

      break;
    }

    prevPosition += GAP;

    if (prevPosition > MAX_POSITION) {
      return null;
    }

    (repositionsMap[position] || (repositionsMap[position] = [])).push(prevPosition);
  }

  return repositionsMap;
};

const getFullRepositionsMap = (positions) => {
  const repositionsMap = {};

  _.forEach(positions, (position, index) => {
    (repositionsMap[position] || (repositionsMap[position] = [])).push(GAP * (index + 1));
  });

  return repositionsMap;
};

module.exports = {
  sync: true,

  inputs: {
    position: {
      type: 'number',
      required: true,
    },
    records: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    const lowers = [];
    const uppers = [];

    inputs.records.forEach(({ position }) => {
      (position <= inputs.position ? lowers : uppers).push(position);
    });

    const beginnings = findBeginnings([...lowers, inputs.position]);

    const repositionsMap =
      getRepositionsMap([...beginnings, ...uppers]) ||
      getFullRepositionsMap([...lowers, inputs.position, ...uppers]);

    const position = repositionsMap[inputs.position]
      ? repositionsMap[inputs.position].pop()
      : inputs.position;

    const repositions = [];

    _.forEachRight(inputs.records, (record) => {
      if (_.isEmpty(repositionsMap[record.position])) {
        return;
      }

      repositions.unshift({
        record,
        position: repositionsMap[record.position].pop(),
      });
    });

    return {
      position,
      repositions,
    };
  },
};
