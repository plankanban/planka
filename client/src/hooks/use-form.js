/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback, useState } from 'react';

export default (initialData) => {
  const [data, setData] = useState(initialData);

  const handleFieldChange = useCallback((_, { type, name: fieldName, value, checked }) => {
    setData((prevData) => ({
      ...prevData,
      [fieldName]: type === 'radio' ? checked : value,
    }));
  }, []);

  return [data, handleFieldChange, setData];
};
