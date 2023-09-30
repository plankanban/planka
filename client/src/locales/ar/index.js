import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'ar',
  country: 'ar',
  name: 'Arabic',
  embeddedLocale: merge(login, core),
};
