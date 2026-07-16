/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const handleBootstrapUpdate = (bootstrap) => ({
  type: EntryActionTypes.BOOTSTRAP_UPDATE_HANDLE,
  payload: {
    bootstrap,
  },
});

export default {
  handleBootstrapUpdate,
};
