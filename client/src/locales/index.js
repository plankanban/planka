import fromPairs from 'lodash/fromPairs';

import cs from './cs/embed';
import de from './de/embed';
import en from './en/embed';
import es from './es/embed';
import fr from './fr/embed';
import ja from './ja/embed';
import pl from './pl/embed';
import ru from './ru/embed';

const localePairs = [
  ['cs', cs],
  ['de', de],
  ['en', en],
  ['es', es],
  ['fr', fr],
  ['ja', ja],
  ['pl', pl],
  ['ru', ru],
];

export const languages = localePairs.map((locale) => locale[0]);

export const embedLocales = fromPairs(localePairs);
