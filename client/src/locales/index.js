import fromPairs from 'lodash/fromPairs';

import en from './en/embed';
import ru from './ru/embed';

const localePairs = [
  ['en', en],
  ['ru', ru],
];

export const languages = localePairs.map((locale) => locale[0]);

export const embedLocales = fromPairs(localePairs);
