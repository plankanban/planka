const MENTIONS_REGEX = /@\[(.*?)\]\(.*?\)/g;

// eslint-disable-next-line import/prefer-default-export
export const formatTextWithMentions = (text) => text.replace(MENTIONS_REGEX, '@$1');
