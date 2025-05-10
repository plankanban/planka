/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Transformers */

export const transformActivity = (activity) => ({
  ...activity,
  ...(activity.createdAt && {
    createdAt: new Date(activity.createdAt),
  }),
});

/* Actions */

const getActivities = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

/* Event handlers */

const makeHandleActivityCreate = (next) => (body) => {
  next({
    ...body,
    item: transformActivity(body.item),
  });
};

export default {
  getActivities,
  makeHandleActivityCreate,
};
