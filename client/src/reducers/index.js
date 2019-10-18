import { combineReducers } from 'redux';

import router from './router';
import socket from './socket';
import orm from './orm';
import auth from './auth';
import app from './app';
import authenticateForm from './forms/authenticate';
import userCreateForm from './forms/user-create';
import projectCreateForm from './forms/project-create';

export default combineReducers({
  router,
  socket,
  orm,
  auth,
  app,
  authenticateForm,
  userCreateForm,
  projectCreateForm,
});
