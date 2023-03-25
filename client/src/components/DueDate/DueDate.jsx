import upperFirst from 'lodash/upperFirst';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './DueDate.module.scss';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const FORMATS = {
  tiny: 'longDate',
  small: 'longDate',
  medium: 'longDateTime',
};

const DueDate = React.memo(({ value, size, isDisabled, onClick, isExpired }) => {
  const [t] = useTranslation();

  const wrapperClass = isExpired ? styles.wrapperExpired : styles.wrapper;

  const contentNode = (
    <span
      className={classNames(
        wrapperClass,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
      )}
    >
      {t(`format:${FORMATS[size]}`, {
        value,
        postProcess: 'formatDate',
      })}
    </span>
  );

  return onClick ? (
    <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

DueDate.propTypes = {
  value: PropTypes.instanceOf(Date).isRequired,
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  isExpired: PropTypes.bool,
};

DueDate.defaultProps = {
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
  isExpired: false,
};

export default DueDate;
