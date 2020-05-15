import { useCallback, useEffect, useRef } from 'react';

export default (close, isOpened = true) => {
  const isClosable = useRef(null);

  const handleFieldBlur = useCallback(() => {
    if (isClosable.current) {
      close();
    }
  }, [close]);

  const handleControlMouseOver = useCallback(() => {
    isClosable.current = false;
  }, []);

  const handleControlMouseOut = useCallback(() => {
    isClosable.current = true;
  }, []);

  useEffect(() => {
    if (isOpened) {
      isClosable.current = true;
    } else {
      isClosable.current = null;
    }
  }, [isOpened]);

  return [handleFieldBlur, handleControlMouseOver, handleControlMouseOut];
};
