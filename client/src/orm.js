import { ORM } from 'redux-orm';

import {
  Action,
  Attachment,
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
  stateSelector: (state) => state.orm,
});

orm.register(
  User,
  Project,
  ProjectMembership,
  Board,
  Label,
  List,
  Card,
  Task,
  Attachment,
  Action,
  Notification,
);

export default orm;
