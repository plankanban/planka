/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback } from 'react';
import { useEventCallback } from '../lib/hooks';

export default (onEscape) => {
  const handleWindowKeydown = useEventCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();

        if (onEscape) {
          onEscape();
        }
      }
    },
    [onEscape],
  );

  const activate = useCallback(() => {
    window.addEventListener('keydown', handleWindowKeydown, true);
  }, [handleWindowKeydown]);

  const deactivate = useCallback(() => {
    window.removeEventListener('keydown', handleWindowKeydown, true);
  }, [handleWindowKeydown]);

  return [activate, deactivate];
};
