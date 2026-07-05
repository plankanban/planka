/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'semantic-ui-react';

const CheckboxValueField = React.memo(({ defaultValue, onUpdate }) => {
  const handleChange = useCallback(
    (event, { checked }) => {
      onUpdate(checked ? 'true' : null);
    },
    [onUpdate],
  );

  return <Checkbox checked={defaultValue === 'true'} onChange={handleChange} />;
});

CheckboxValueField.propTypes = {
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

CheckboxValueField.defaultProps = {
  defaultValue: undefined,
};

export default CheckboxValueField;
