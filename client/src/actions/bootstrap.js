/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleBootstrapUpdate = (bootstrap) => ({
  type: ActionTypes.BOOTSTRAP_UPDATE_HANDLE,
  payload: {
    bootstrap,
  },
});

export default {
  handleBootstrapUpdate,
};
