import { ORM } from 'redux-orm';

import {
  Activity,
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
  Activity,
  Notification,
);

export default orm;
