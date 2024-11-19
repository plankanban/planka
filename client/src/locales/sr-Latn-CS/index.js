import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'sr-Latn-CS',
  country: 'rs',
  name: 'Srpski (latinica)',
  embeddedLocale: merge(login, core),
};
