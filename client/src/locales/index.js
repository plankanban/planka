import fromPairs from 'lodash/fromPairs';

import enUS from './en-US/embed';
import ruRU from './ru-RU/embed';

const localePairs = [
  ['en-US', enUS],
  ['ru-RU', ruRU],
];

export const languages = localePairs.map((locale) => locale[0]);

export const embedLocales = fromPairs(localePairs);
