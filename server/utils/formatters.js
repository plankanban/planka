const MENTIONS_REGEX = /@\[(.*?)\]\(.*?\)/g;

const formatTextWithMentions = (text) => text.replace(MENTIONS_REGEX, '@$1');

module.exports = {
  formatTextWithMentions,
};
