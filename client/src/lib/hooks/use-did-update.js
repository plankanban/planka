import { useEffect, useRef } from 'react';

export default (callback, dependencies) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      callback();
    } else {
      isMounted.current = true;
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};
