/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const SortOrders = {
  ASC: 'asc',
  DESC: 'desc',
};

export const EditorModes = {
  WYSIWYG: 'wysiwyg',
  MARKUP: 'markup',
};

export const HomeViews = {
  GRID_PROJECTS: 'gridProjects',
  GROUPED_PROJECTS: 'groupedProjects',
};

export const UserRoles = {
  ADMIN: 'admin',
  PROJECT_OWNER: 'projectOwner',
  BOARD_USER: 'boardUser',
};

export const ProjectOrders = {
  BY_DEFAULT: 'byDefault',
  ALPHABETICALLY: 'alphabetically',
  BY_CREATION_TIME: 'byCreationTime',
};

export const ProjectGroups = {
  MY_OWN: 'myOwn',
  TEAM: 'team',
  SHARED_WITH_ME: 'sharedWithMe',
  OTHERS: 'others',
};

export const ProjectTypes = {
  PRIVATE: 'private',
  SHARED: 'shared',
};

export const ProjectBackgroundTypes = {
  GRADIENT: 'gradient',
  IMAGE: 'image',
};

export const BoardViews = {
  KANBAN: 'kanban',
  GRID: 'grid',
  LIST: 'list',
};

export const BoardContexts = {
  BOARD: 'board',
  ARCHIVE: 'archive',
  TRASH: 'trash',
};

export const BoardMembershipRoles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

export const ListTypes = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVE: 'archive',
  TRASH: 'trash',
};

export const ListTypeStates = {
  OPENED: 'opened',
  CLOSED: 'closed',
};

export const ListSortFieldNames = {
  NAME: 'name',
  DUE_DATE: 'dueDate',
  CREATED_AT: 'createdAt',
};

export const CardTypes = {
  PROJECT: 'project',
  STORY: 'story',
};

export const AttachmentTypes = {
  FILE: 'file',
  LINK: 'link',
};

export const ActivityTypes = {
  CREATE_CARD: 'createCard',
  MOVE_CARD: 'moveCard',
  ADD_MEMBER_TO_CARD: 'addMemberToCard',
  REMOVE_MEMBER_FROM_CARD: 'removeMemberFromCard',
  COMPLETE_TASK: 'completeTask',
  UNCOMPLETE_TASK: 'uncompleteTask',
};

export const NotificationTypes = {
  MOVE_CARD: 'moveCard',
  COMMENT_CARD: 'commentCard',
  ADD_MEMBER_TO_CARD: 'addMemberToCard',
  MENTION_IN_COMMENT: 'mentionInComment',
};

export const NotificationServiceFormats = {
  TEXT: 'text',
  MARKDOWN: 'markdown',
  HTML: 'html',
};
