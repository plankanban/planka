/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * watcher hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineWatcherHook(sails) {
  const checkSocketConnectionsToLogout = () => {
    [...sails.io.sockets.adapter.rooms.keys()].forEach((room) => {
      if (!room.startsWith('@accessToken:')) {
        return;
      }

      const accessToken = room.split(':')[1];

      try {
        sails.helpers.utils.verifyJwtToken(accessToken);
      } catch (error) {
        sails.sockets.broadcast(room, 'logout');
        sails.sockets.leaveAll(room);
      }
    });
  };

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`watcher`)');

      setInterval(checkSocketConnectionsToLogout, 60 * 1000);
    },
  };
};
