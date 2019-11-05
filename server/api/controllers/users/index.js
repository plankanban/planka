module.exports = {
  async fn(inputs, exits) {
    const users = await sails.helpers.getUsers();

    return exits.success({
      items: users,
    });
  },
};
