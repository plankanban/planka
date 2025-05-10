/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';

import MaskedInput from './MaskedInput';

const InputMask = React.forwardRef(({ mask, maskChar, ...props }, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Input {...props} ref={ref} input={<MaskedInput mask={mask} maskChar={maskChar} />} />
));

InputMask.propTypes = {
  mask: PropTypes.string.isRequired,
  maskChar: PropTypes.string,
};

InputMask.defaultProps = {
  maskChar: undefined,
};

export default React.memo(InputMask);
