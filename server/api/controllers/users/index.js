module.exports = {
  async fn() {
    const users = await sails.helpers.users.getMany();

    return {
      items: users,
    };
  },
};
