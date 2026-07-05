/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';

import styles from './DateValueField.module.scss';

const parseIsoDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatIsoDate = (date) =>
  [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
  ].join('-');

const DateValueField = React.memo(({ defaultValue, onUpdate }) => {
  const handleChange = useCallback(
    (date) => {
      onUpdate(date ? formatIsoDate(date) : null);
    },
    [onUpdate],
  );

  return (
    <DatePicker
      isClearable
      className={styles.field}
      selected={parseIsoDate(defaultValue)}
      onChange={handleChange}
    />
  );
});

DateValueField.propTypes = {
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

DateValueField.defaultProps = {
  defaultValue: undefined,
};

export default DateValueField;
