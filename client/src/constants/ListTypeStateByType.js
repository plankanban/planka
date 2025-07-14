/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { ListTypes, ListTypeStates } from './Enums';

export default {
  [ListTypes.ACTIVE]: ListTypeStates.OPENED,
  [ListTypes.CLOSED]: ListTypeStates.CLOSED,
};
