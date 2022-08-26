const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;

export const isPassword = (string) => {
  return string.length >= 3 && PASSWORD_REGEX.test(string);
};

export const isUsername = (string) => {
  return string.length >= 3 && string.length <= 16 && USERNAME_REGEX.test(string);
};
