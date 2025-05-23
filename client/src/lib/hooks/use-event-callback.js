/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback, useEffect, useRef } from 'react';

export default (callback, dependencies) => {
  const callbackRef = useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return useCallback((...args) => callbackRef.current(...args), []);
};
