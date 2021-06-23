module.exports = {
  async fn() {
    const users = await sails.helpers.users.getMany({
      isAdmin: true,
    });

    return sails.helpers.utils.mapRecords(users);
  },
};
