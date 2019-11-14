import React, { useCallback } from 'react';
import { Icon, Input } from 'semantic-ui-react';
import { useToggle } from '../../../hooks';

const InputPassword = React.forwardRef((props, ref) => {
  const [isHidden, toggleHidden] = useToggle(true);

  const handleToggleClick = useCallback(() => {
    toggleHidden();
  }, [toggleHidden]);

  return (
    <Input
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      ref={ref}
      type={isHidden ? 'password' : 'text'}
      icon={<Icon link name={isHidden ? 'eye slash' : 'eye'} onClick={handleToggleClick} />}
    />
  );
});

export default React.memo(InputPassword);
