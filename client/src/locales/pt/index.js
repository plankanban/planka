import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'pt',
  country: 'br',
  name: 'Português',
  embeddedLocale: merge(login, core),
};
