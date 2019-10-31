import { useCallback, useState } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((_, { value: nextValue }) => {
    setValue(nextValue);
  }, []);

  return [value, handleChange, setValue];
};
