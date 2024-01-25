import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'hu',
  country: 'hu',
  name: 'Magyar',
  embeddedLocale: merge(login, core),
};
