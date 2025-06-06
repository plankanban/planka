import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'fi-FI',
  country: 'fi',
  name: 'Suomi',
  embeddedLocale: merge(login, core),
};
