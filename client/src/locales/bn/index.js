import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'bn',
  country: 'bn',
  name: 'Bengali',
  embeddedLocale: merge(login, core),
};
