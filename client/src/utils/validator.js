import zxcvbn from 'zxcvbn';

const USERNAME_REGEX = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;

export const isPassword = (string) => zxcvbn(string).score >= 2; // TODO: move to config

export const isUsername = (string) =>
  string.length >= 3 && string.length <= 16 && USERNAME_REGEX.test(string);

export const isGithubLink = (string) => {
  const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate the protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // validate the domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR validate the IP (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate the port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate the query string
    '(\\#[-a-z\\d_]*)?$','i'); // validate the fragment locator
  return !!urlPattern.test(string) && string.startsWith('https://github.com/');
};
