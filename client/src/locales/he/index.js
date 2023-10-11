import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'he',
  country: 'il',
  name: 'Hebrew',
  embeddedLocale: merge(login, core),
};
