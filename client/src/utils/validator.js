import zxcvbn from 'zxcvbn';

const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;

export const isPassword = (string) => zxcvbn(string).score >= 2; // TODO: move to config

export const isUsername = (string) =>
  string.length >= 3 && string.length <= 16 && USERNAME_REGEX.test(string);
