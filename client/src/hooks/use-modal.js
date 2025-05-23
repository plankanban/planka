/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback, useState } from 'react';

// TODO: rename?
export default (initialParams) => {
  const [modal, setModal] = useState(() => initialParams);

  const open = useCallback((params) => {
    setModal(params);
  }, []);

  const handleClose = useCallback(() => {
    setModal(null);
  }, []);

  return [modal, open, handleClose];
};
