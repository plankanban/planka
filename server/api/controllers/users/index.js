module.exports = {
  fn: async function(inputs, exits) {
    const users = await sails.helpers.getUsers();

    return exits.success({
      items: users
    });
  }
};
