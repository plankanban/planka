const USERNAME_REGEX = /^[a-zA-Z0-9]+(_?[a-zA-Z0-9])*$/;

// eslint-disable-next-line import/prefer-default-export
export const isUsername = (string) => {
  return string.length >= 3 && string.length <= 16 && USERNAME_REGEX.test(string);
};
