/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getCardPriorityColor } from '../../../constants/CardPriorities';

import styles from './PriorityChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const PriorityChip = React.memo(({ value, size, isDisabled, onClick }) => {
  const contentNode = (
    <span
      style={{
        '--priority-color': getCardPriorityColor(value),
      }}
      className={classNames(styles.wrapper, styles[`wrapper${upperFirst(size)}`])}
    >
      {value}
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

PriorityChip.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

PriorityChip.defaultProps = {
  size: Sizes.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default PriorityChip;
