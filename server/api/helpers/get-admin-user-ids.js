module.exports = {
  async fn(inputs, exits) {
    const users = await sails.helpers.getUsers({
      isAdmin: true,
    });

    const userIds = sails.helpers.mapRecords(users);

    return exits.success(userIds);
  },
};
