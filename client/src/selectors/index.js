import router from './router';
import core from './core';
import modals from './modals';
import users from './users';
import projects from './projects';
import projectManagers from './project-managers';
import boards from './boards';
import boardMemberships from './board-memberships';
import lists from './lists';
import cards from './cards';
import tasks from './tasks';
import attachments from './attachments';

export default {
  ...router,
  ...core,
  ...modals,
  ...users,
  ...projects,
  ...projectManagers,
  ...boards,
  ...boardMemberships,
  ...lists,
  ...cards,
  ...tasks,
  ...attachments,
};
