import { useCallback, useRef } from 'react';

export default (nestedRefName = 'ref') => {
  const ref = useRef(null);

  const handleRef = useCallback(
    (element) => {
      ref.current = element?.[nestedRefName].current;
    },
    [nestedRefName],
  );

  return [ref, handleRef];
};
