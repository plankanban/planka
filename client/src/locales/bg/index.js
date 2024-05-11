import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'bg',
  country: 'bg',
  name: 'Български',
  embeddedLocale: merge(login, core),
};
