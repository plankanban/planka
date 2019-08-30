import { useCallback, useState } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback(({ target: { value: nextValue } }) => {
    setValue(nextValue);
  }, []);

  return [value, handleChange, setValue];
};
