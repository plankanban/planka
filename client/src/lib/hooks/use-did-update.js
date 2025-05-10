/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useEffect, useRef } from 'react';

export default (callback, dependencies) => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (isMountedRef.current) {
      callback();
    } else {
      isMountedRef.current = true;
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};
