const getFullSeconds = ({ startedAt, total }) => {
  if (startedAt) {
    return Math.floor((new Date() - startedAt) / 1000) + total;
  }

  return total;
};

export const createTimer = ({ hours, minutes, seconds }) => ({
  startedAt: null,
  total: hours * 60 * 60 + minutes * 60 + seconds,
});

export const updateTimer = ({ startedAt }, parts) => ({
  ...createTimer(parts),
  startedAt: startedAt && new Date(),
});

export const startTimer = (timer) => ({
  startedAt: new Date(),
  total: timer ? timer.total : 0,
});

export const stopTimer = (timer) => ({
  startedAt: null,
  total: getFullSeconds(timer),
});

export const getTimerParts = (timer) => {
  const fullSeconds = getFullSeconds(timer);

  const hours = Math.floor(fullSeconds / 3600);
  const minutes = Math.floor((fullSeconds - hours * 3600) / 60);
  const seconds = fullSeconds - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  };
};

export const formatTimer = (timer) => {
  const { hours, minutes, seconds } = getTimerParts(timer);

  return [hours, ...[minutes, seconds].map((part) => (part < 10 ? `0${part}` : part))].join(':');
};
