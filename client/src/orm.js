import { ORM } from 'redux-orm';

import {
  Action,
  Board,
  Card,
  Label,
  List,
  Notification,
  Project,
  ProjectMembership,
  Task,
  User,
} from './models';

const orm = new ORM({
  stateSelector: state => state.orm,
});

orm.register(
  User,
  Project,
  ProjectMembership,
  Board,
  List,
  Label,
  Card,
  Task,
  Action,
  Notification,
);

export default orm;
