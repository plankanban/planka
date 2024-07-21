const _ = require('lodash');

const LANGUAGES = [
  'bg-BG',
  'cs-CZ',
  'da-DK',
  'de-DE',
  'en-US',
  'es-ES',
  'fa-IR',
  'fr-FR',
  'hu-HU',
  'id-ID',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'nl-NL',
  'pl-PL',
  'pt-BR',
  'ro-RO',
  'ru-RU',
  'sk-SK',
  'sv-SE',
  'tr-TR',
  'uz-UZ',
  'zh-CN',
];

const LANGUAGE_BY_PREV_LANGUAGE = LANGUAGES.reduce(
  (result, language) => ({
    ...result,
    [language.split('-')[0]]: language,
  }),
  {},
);
LANGUAGE_BY_PREV_LANGUAGE.ua = 'uk-UA';

const PREV_LANGUAGE_BY_LANGUAGE = _.invert(LANGUAGE_BY_PREV_LANGUAGE);

module.exports.up = async (knex) => {
  const users = await knex('user_account').whereNotNull('language');
  const prevLanguages = [...new Set(users.map((user) => user.language))];

  // eslint-disable-next-line no-restricted-syntax
  for (const prevLanguage of prevLanguages) {
    // eslint-disable-next-line no-await-in-loop
    await knex('user_account')
      .update({
        language: LANGUAGE_BY_PREV_LANGUAGE[prevLanguage],
      })
      .where('language', prevLanguage);
  }
};

module.exports.down = async (knex) => {
  const users = await knex('user_account').whereNotNull('language');
  const languages = [...new Set(users.map((user) => user.language))];

  // eslint-disable-next-line no-restricted-syntax
  for (const language of languages) {
    // eslint-disable-next-line no-await-in-loop
    await knex('user_account')
      .update({
        language: PREV_LANGUAGE_BY_LANGUAGE[language],
      })
      .where('language', language);
  }
};
