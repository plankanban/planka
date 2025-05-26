import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'pl-PL',
  country: 'pl',
  name: 'Polski',
  embeddedLocale: merge(login, core),
};
