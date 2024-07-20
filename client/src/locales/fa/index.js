import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'fa',
  country: 'ir',
  name: 'فارسی',
  embeddedLocale: merge(login, core),
};
