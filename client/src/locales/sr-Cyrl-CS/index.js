import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'sr-Cyrl-CS',
  country: 'rs',
  name: 'Српски (ћирилица)',
  embeddedLocale: merge(login, core),
};
