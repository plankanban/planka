/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import Config from '../constants/Config';

export const isComposing = (event) => event.nativeEvent.isComposing || event.keyCode === 229;

export const isModifierKeyPressed = (event) => (Config.IS_MAC ? event.metaKey : event.ctrlKey);
