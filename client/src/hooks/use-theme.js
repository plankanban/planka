/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from '../selectors';
import { getTheme, setTheme, subscribeToThemeChange } from '../utils/theme-storage';

// The current user's theme choice and a setter for it, kept in step across components
export default () => {
  const userId = useSelector(selectors.selectCurrentUserId);
  const [theme, setThemeState] = useState(() => getTheme(userId));

  useEffect(() => {
    setThemeState(getTheme(userId));

    return subscribeToThemeChange(() => {
      setThemeState(getTheme(userId));
    });
  }, [userId]);

  const handleChange = useCallback(
    (nextTheme) => {
      setTheme(userId, nextTheme);
    },
    [userId],
  );

  return [theme, handleChange];
};
