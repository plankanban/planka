/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback, useState } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((_, { value: nextValue }) => {
    setValue(nextValue);
  }, []);

  return [value, handleChange, setValue];
};
