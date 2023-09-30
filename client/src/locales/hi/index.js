import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'hi',
  country: 'hi',
  name: 'Hindi',
  embeddedLocale: merge(login, core),
};
