/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { ListTypes, UserRoles } from '../constants/Enums';

export const isUserAdminOrProjectOwner = (user) =>
  [UserRoles.ADMIN, UserRoles.PROJECT_OWNER].includes(user.role);

export const isListArchiveOrTrash = (list) =>
  [ListTypes.ARCHIVE, ListTypes.TRASH].includes(list.type);

export const isListFinite = (list) => [ListTypes.ACTIVE, ListTypes.CLOSED].includes(list.type);
