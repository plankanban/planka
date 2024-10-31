import { useCallback, useEffect, useMemo, useRef } from 'react';

export default (elementRefs, onAwayClick, onCancel) => {
  const pressedElement = useRef(null);

  const handlePress = useCallback((event) => {
    pressedElement.current = event.target;
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      const element = elementRefs.find(({ current }) => current?.contains(event.target))?.current;

      if (element) {
        if (!pressedElement.current || pressedElement.current !== element) {
          onCancel();
        }
      } else if (pressedElement.current) {
        onCancel();
      } else {
        onAwayClick();
      }

      pressedElement.current = null;
    };

    document.addEventListener('mouseup', handleEvent, true);
    document.addEventListener('touchend', handleEvent, true);

    return () => {
      document.removeEventListener('mouseup', handleEvent, true);
      document.removeEventListener('touchend', handleEvent, true);
    };
  }, [onAwayClick, onCancel]); // eslint-disable-line react-hooks/exhaustive-deps

  const props = useMemo(
    () => ({
      onMouseDown: handlePress,
      onTouchStart: handlePress,
    }),
    [handlePress],
  );

  return props;
};
