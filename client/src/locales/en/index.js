import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'en',
  country: 'gb',
  name: 'English',
  embeddedLocale: merge(login, core),
};
