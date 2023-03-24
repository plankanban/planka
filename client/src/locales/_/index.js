import fromPairs from 'lodash/fromPairs';

import zh from './zh/embed';

const localePairs = [
  ['cs', cs],
  ['da', da],
  ['de', de],
  ['en', en],
  ['es', es],
  ['fr', fr],
  ['ja', ja],
  ['pl', pl],
  ['ru', ru],
  ['uz', uz],
  ['zh', zh],
];

export const languages = localePairs.map((locale) => locale[0]);

export const embedLocales = fromPairs(localePairs);
