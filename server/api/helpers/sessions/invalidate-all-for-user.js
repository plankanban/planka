/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    userId: {
      type: 'string',
      required: true,
    },
    exceptSessionId: {
      type: 'string',
      allowNull: true,
    },
  },

  async fn(inputs) {
    const criteria = {
      userId: inputs.userId,
      deletedAt: null,
    };
    if (inputs.exceptSessionId) {
      criteria.id = { '!=': inputs.exceptSessionId };
    }

    const sessions = await Session.find(criteria);
    if (sessions.length === 0) {
      return;
    }

    await Session.update(criteria).set({
      deletedAt: new Date().toISOString(),
    });

    sessions.forEach((session) => {
      if (session.accessToken) {
        const roomName = `@accessToken:${session.accessToken}`;
        sails.sockets.broadcast(roomName, 'logout');
        sails.sockets.leaveAll(roomName);
      }
    });
  },
};
