import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'ar-YE',
  country: 'ye',
  name: 'العربية',
  embeddedLocale: merge(login, core),
};
