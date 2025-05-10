/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const getFullSeconds = ({ startedAt, total }) => {
  if (startedAt) {
    return Math.floor((new Date() - startedAt) / 1000) + total;
  }

  return total;
};

export const createStopwatch = ({ hours, minutes, seconds }) => ({
  startedAt: null,
  total: hours * 60 * 60 + minutes * 60 + seconds,
});

export const updateStopwatch = ({ startedAt }, parts) => ({
  ...createStopwatch(parts),
  startedAt: startedAt && new Date(),
});

export const startStopwatch = (stopwatch) => ({
  startedAt: new Date(),
  total: stopwatch ? stopwatch.total : 0,
});

export const stopStopwatch = (stopwatch) => ({
  startedAt: null,
  total: getFullSeconds(stopwatch),
});

export const getStopwatchParts = (stopwatch) => {
  const fullSeconds = getFullSeconds(stopwatch);

  const hours = Math.floor(fullSeconds / 3600);
  const minutes = Math.floor((fullSeconds - hours * 3600) / 60);
  const seconds = fullSeconds - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  };
};

export const formatStopwatch = (stopwatch) => {
  const { hours, minutes, seconds } = getStopwatchParts(stopwatch);
  return [hours, ...[minutes, seconds].map((part) => (part < 10 ? `0${part}` : part))].join(':');
};
