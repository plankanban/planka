import React, { useCallback } from 'react';
import { Icon, Input } from 'semantic-ui-react';
import { useToggle } from '../../../hooks';

const InputPassword = React.forwardRef((props, ref) => {
  const [isVisible, toggleVisible] = useToggle();

  const handleToggleClick = useCallback(() => {
    toggleVisible();
  }, [toggleVisible]);

  return (
    <Input
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      ref={ref}
      type={isVisible ? 'text' : 'password'}
      icon={<Icon link name={isVisible ? 'eye' : 'eye slash'} onClick={handleToggleClick} />}
    />
  );
});

export default React.memo(InputPassword);
