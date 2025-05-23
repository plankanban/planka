/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import Config from '../constants/Config';

// eslint-disable-next-line import/prefer-default-export
export const isModifierKeyPressed = (event) => (Config.IS_MAC ? event.metaKey : event.ctrlKey);
