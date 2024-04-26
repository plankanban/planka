const findUserByUsernameOrEmail = (usernameOrEmail, users) => {
  return users.find((user) => user.username === usernameOrEmail || user.email === usernameOrEmail);
};

module.exports = {
  inputs: {
    comment: {
      type: 'string',
      required: true,
    },
    users: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const { comment, users } = inputs;
    const mentionRegex = /\[@(.*?)\]/g;

    return comment.match(mentionRegex).map((match) => {
      mentionRegex.lastIndex = 0;
      const nameOrEmail = mentionRegex.exec(match)[1];
      const member = findUserByUsernameOrEmail(nameOrEmail, users);

      return member.id;
    });
  },
};
