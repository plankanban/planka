import React from 'react';
import PropTypes from 'prop-types';
import { Input as SemanticUIInput } from 'semantic-ui-react';

import MaskedInput from './MaskedInput';

const Input = React.forwardRef(({ mask, maskChar, ...props }, ref) => {
  const nextProps = props;

  if (mask) {
    nextProps.input = <MaskedInput mask={mask} maskChar={maskChar} />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <SemanticUIInput {...nextProps} ref={ref} />;
});

Input.propTypes = {
  mask: PropTypes.string,
  maskChar: PropTypes.string,
};

Input.defaultProps = {
  mask: undefined,
  maskChar: undefined,
};

export default React.memo(Input);
