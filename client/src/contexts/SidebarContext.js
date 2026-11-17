/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createContext } from 'react';

// [isOpen, setIsOpen] for the sidebar on narrow screens, where it slides in over the content
export default createContext([false, () => {}]);
