module.exports = {
  async fn() {
    const { accessToken } = this.req;

    await Session.updateOne({
      accessToken,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toISOString(),
    });

    return {
      item: accessToken,
    };
  },
};
