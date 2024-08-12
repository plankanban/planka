import upperFirst from 'lodash/upperFirst';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Checkbox } from 'semantic-ui-react';

import getDateFormat from '../../utils/get-date-format';

import styles from './DueDate.module.scss';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const LONG_DATE_FORMAT_BY_SIZE = {
  tiny: 'longDate',
  small: 'longDate',
  medium: 'longDateTime',
};

const FULL_DATE_FORMAT_BY_SIZE = {
  tiny: 'fullDate',
  small: 'fullDate',
  medium: 'fullDateTime',
};

const getDueClass = (value) => {
  const now = new Date();
  const tomorrow = new Date(now).setDate(now.getDate() + 1);

  if (now > value) return styles.overdue;
  if (tomorrow > value) return styles.soon;
  return null;
};

const DueDate = React.memo(
  ({ value, completed, size, isDisabled, onClick, onUpdateCompletion }) => {
    const [t] = useTranslation();

    const dateFormat = getDateFormat(
      value,
      LONG_DATE_FORMAT_BY_SIZE[size],
      FULL_DATE_FORMAT_BY_SIZE[size],
    );

    const classes = [
      styles.wrapper,
      styles[`wrapper${upperFirst(size)}`],
      onClick && styles.wrapperHoverable,
      completed ? styles.completed : getDueClass(value),
    ];

    const handleToggleChange = useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDisabled) onUpdateCompletion(!completed);
      },
      [onUpdateCompletion, completed, isDisabled],
    );

    return onClick ? (
      <div className={styles.wrapperGroup}>
        <button
          type="button"
          aria-label="Toggle completion"
          className={classNames(...classes, styles.wrapperCheckbox)}
          onClick={handleToggleChange}
        >
          <Checkbox
            className={styles.checkbox}
            checked={completed}
            disabled={isDisabled}
            onChange={handleToggleChange}
          />
        </button>
        <button
          type="button"
          disabled={isDisabled}
          className={classNames(...classes, styles.wrapperButton)}
          onClick={onClick}
        >
          <span>
            {t(`format:${dateFormat}`, {
              value,
              postProcess: 'formatDate',
            })}
          </span>
        </button>
      </div>
    ) : (
      <span className={classNames(...classes)}>
        {t(`format:${dateFormat}`, {
          value,
          postProcess: 'formatDate',
        })}
      </span>
    );
  },
);

DueDate.propTypes = {
  value: PropTypes.instanceOf(Date).isRequired,
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  completed: PropTypes.bool,
  onClick: PropTypes.func,
  onUpdateCompletion: PropTypes.func,
};

DueDate.defaultProps = {
  size: SIZES.MEDIUM,
  isDisabled: false,
  completed: false,
  onClick: undefined,
  onUpdateCompletion: undefined,
};

export default DueDate;
