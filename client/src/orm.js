import { ORM } from 'redux-orm';

import {
  Action,
  Attachment,
  Board,
  BoardMembership,
  Card,
  Label,
  List,
  Notification,
  Project,
  ProjectManager,
  Task,
  User,
} from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(
  User,
  Project,
  ProjectManager,
  Board,
  BoardMembership,
  Label,
  List,
  Card,
  Task,
  Attachment,
  Action,
  Notification,
);

export default orm;
