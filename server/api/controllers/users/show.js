module.exports = {
  fn: async function(inputs, exits) {
    // TODO: allow over HTTP without subscription
    if (!this.req.isSocket) {
      return this.res.badRequest();
    }

    const { currentUser } = this.req;

    sails.sockets.join(this.req, `user:${currentUser.id}`); // TODO: only when subscription needed

    return exits.success({
      item: currentUser
    });
  }
};
