import merge from 'lodash/merge';
import fromPairs from 'lodash/fromPairs';

import csLogin from './cs/login';
import daLogin from './da/login';
import deLogin from './de/login';
import enLogin from './en/login';
import enCore from './en/core';
import esLogin from './es/login';
import frLogin from './fr/login';
import jaLogin from './ja/login';
import plLogin from './pl/login';
import ruLogin from './ru/login';
import skLogin from './sk/login';
import svLogin from './sv/login';
import uzLogin from './uz/login';
import zhLogin from './zh/login';

const localePairs = [
  ['cs', csLogin],
  ['da', daLogin],
  ['de', deLogin],
  ['en', merge(enLogin, enCore)],
  ['es', esLogin],
  ['fr', frLogin],
  ['ja', jaLogin],
  ['pl', plLogin],
  ['ru', ruLogin],
  ['sk', skLogin],
  ['sv', svLogin],
  ['uz', uzLogin],
  ['zh', zhLogin],
];

export const languages = localePairs.map((locale) => locale[0]);

export const embedLocales = fromPairs(localePairs);
