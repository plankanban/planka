/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import {
  BoardContexts,
  BoardMembershipRoles,
  BoardViews,
  CardTypes,
  HomeViews,
  ListTypes,
  ProjectGroups,
  ProjectOrders,
  ProjectTypes,
  UserRoles,
} from './Enums';

export const HomeViewIcons = {
  [HomeViews.GRID_PROJECTS]: 'th',
  [HomeViews.GROUPED_PROJECTS]: 'th list',
};

export const UserRoleIcons = {
  [UserRoles.ADMIN]: 'user secret',
  [UserRoles.PROJECT_OWNER]: 'building',
  [UserRoles.BOARD_USER]: 'columns',
};

export const ProjectOrderIcons = {
  [ProjectOrders.BY_DEFAULT]: 'sort',
  [ProjectOrders.ALPHABETICALLY]: 'sort alphabet down',
  [ProjectOrders.BY_CREATION_TIME]: 'clock outline',
};

export const ProjectGroupIcons = {
  [ProjectGroups.MY_OWN]: 'user',
  [ProjectGroups.TEAM]: 'group',
  [ProjectGroups.SHARED_WITH_ME]: 'location arrow',
  [ProjectGroups.OTHERS]: 'user secret',
};

export const ProjectTypeIcons = {
  [ProjectTypes.PRIVATE]: 'privacy',
  [ProjectTypes.SHARED]: 'group',
};

export const BoardViewIcons = {
  [BoardViews.KANBAN]: 'columns',
  [BoardViews.GRID]: 'th',
  [BoardViews.LIST]: 'unordered list',
};

export const BoardContextIcons = {
  [BoardContexts.BOARD]: 'suitcase',
  [BoardContexts.ARCHIVE]: 'archive',
  [BoardContexts.TRASH]: 'trash alternate',
};

export const BoardMembershipRoleIcons = {
  [BoardMembershipRoles.EDITOR]: 'star',
  [BoardMembershipRoles.VIEWER]: 'eye',
};

export const ListTypeIcons = {
  [ListTypes.ACTIVE]: 'lightbulb',
  [ListTypes.CLOSED]: 'flag checkered',
  [ListTypes.ARCHIVE]: 'archive',
  [ListTypes.TRASH]: 'trash alternate',
};

export const CardTypeIcons = {
  [CardTypes.PROJECT]: 'list alternate outline',
  [CardTypes.STORY]: 'images outline',
};
