/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createContext } from 'react';

const CardKeyboardShortcutsContext = createContext({
  setHoveredCard: () => {},
  clearHoveredCard: () => {},
});

export default CardKeyboardShortcutsContext;
