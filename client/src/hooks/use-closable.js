/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback, useRef } from 'react';

export default (initialValue = false) => {
  const isActiveRef = useRef(initialValue);

  const setIsActive = useCallback((isActive) => {
    setTimeout(() => {
      isActiveRef.current = isActive;
    });
  }, []);

  const activate = useCallback(() => {
    setIsActive(true);
  }, [setIsActive]);

  const deactivate = useCallback(() => {
    setIsActive(false);
  }, [setIsActive]);

  return [isActiveRef, activate, deactivate, setIsActive];
};
