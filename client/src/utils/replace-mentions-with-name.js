const findUserByUsernameOrEmail = (usernameOrEmail, users) => {
  return users.find(
    (member) => member.user.username === usernameOrEmail || member.user.email === usernameOrEmail,
  );
};

const replaceMentionsWithName = (text, users) => {
  const mentionRegex = /\[@(.*?)\]/g;
  return text.replace(mentionRegex, function (matched) {
    mentionRegex.lastIndex = 0;

    const mentionMatch = matched.match(mentionRegex)[0];
    const nameOrEmail = mentionRegex.exec(mentionMatch)[1];
    const member = findUserByUsernameOrEmail(nameOrEmail, users);

    return member ? `[${member.user.name}](#)` : matched;
  });
};

export default replaceMentionsWithName;
