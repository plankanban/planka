import dequal from 'dequal';
import { useRef } from 'react';

export default (value) => {
  const currentValue = useRef();

  if (!dequal(value, currentValue.current)) {
    currentValue.current = value;
  }

  return currentValue.current;
};
