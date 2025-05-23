/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { currentSession } = this.req;

    await Session.qm.deleteOneById(currentSession.id);

    sails.sockets.leaveAll(`@accessToken:${currentSession.accessToken}`);

    if (currentSession.httpOnlyToken && !this.req.isSocket) {
      sails.helpers.utils.clearHttpOnlyTokenCookie(this.res);
    }

    return {
      item: currentSession.accessToken,
    };
  },
};
