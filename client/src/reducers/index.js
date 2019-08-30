import { combineReducers } from 'redux';

import router from './router';
import socket from './socket';
import db from './db';
import auth from './auth';
import login from './login';
import app from './app';
import user from './user';
import project from './project';

export default combineReducers({
  router,
  socket,
  db,
  auth,
  login,
  app,
  user,
  project,
});
