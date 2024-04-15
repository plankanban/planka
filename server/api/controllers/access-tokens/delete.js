module.exports = {
  async fn() {
    const { accessToken } = this.req;

    await Session.updateOne({
      accessToken,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toISOString(),
    });

    if (this.req.isSocket) {
      sails.sockets.leaveAll(`@accessToken:${accessToken}`);
    }

    return {
      item: accessToken,
    };
  },
};
