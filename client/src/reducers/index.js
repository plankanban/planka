/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux';

import router from './router';
import socket from './socket';
import orm from './orm';
import common from './common';
import auth from './auth';
import core from './core';
import ui from './ui';

export default combineReducers({
  router,
  socket,
  orm,
  common,
  auth,
  core,
  ui,
});
