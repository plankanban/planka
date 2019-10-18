import { useEffect, useRef } from 'react';

export default (value) => {
  const prevValue = useRef(value);

  useEffect(() => {
    prevValue.current = value;
  }, [value]);

  return prevValue.current;
};
