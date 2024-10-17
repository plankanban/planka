module.exports = {
  async fn() {
    const { currentSession } = this.req;

    await Session.updateOne({
      id: currentSession.id,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toISOString(),
    });

    sails.sockets.leaveAll(`@accessToken:${currentSession.accessToken}`);

    if (currentSession.httpOnlyToken && !this.req.isSocket) {
      sails.helpers.utils.clearHttpOnlyTokenCookie(this.res);
    }

    return {
      item: currentSession.accessToken,
    };
  },
};
