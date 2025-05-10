/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createRouterReducer } from '../lib/redux-router';

import history from '../history';

export default createRouterReducer(history);
