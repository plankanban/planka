/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

import globalStyles from '../../../styles.module.scss';
import styles from './SelectValueField.module.scss';

const SelectValueField = React.memo(({ defaultValue, options, onUpdate }) => {
  const dropdownOptions = useMemo(
    () =>
      options.map((option) => ({
        key: option.id,
        value: option.id,
        text: option.name,
        label: option.color && {
          empty: true,
          circular: true,
          className: globalStyles[`background${upperFirst(camelCase(option.color))}`],
        },
      })),
    [options],
  );

  const handleChange = useCallback(
    (event, { value }) => {
      onUpdate(value || null);
    },
    [onUpdate],
  );

  return (
    <Dropdown
      fluid
      selection
      clearable
      className={styles.field}
      value={defaultValue || ''}
      options={dropdownOptions}
      onChange={handleChange}
    />
  );
});

SelectValueField.propTypes = {
  defaultValue: PropTypes.string,
  options: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

SelectValueField.defaultProps = {
  defaultValue: undefined,
};

export default SelectValueField;
