import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'da-DK',
  country: 'dk',
  name: 'Dansk',
  embeddedLocale: merge(login, core),
};
