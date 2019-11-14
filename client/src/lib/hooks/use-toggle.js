import { useCallback, useState } from 'react';

export default (defaultState = false) => {
  const [state, setState] = useState(defaultState);

  const toggle = useCallback(() => {
    setState((prevState) => !prevState);
  }, []);

  return [state, toggle];
};
