/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useTranslation } from 'react-i18next';
import styles from './LinkChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const LinkChip = React.memo(({ kind, size, onClick }) => {
  const { t } = useTranslation();

  const getKindName = useCallback(() => t(`common.${kind}`), [t, kind]);

  const contentNode = (
    <span
      title={getKindName()}
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
        styles[`linkChip-${kind.toLowerCase()}`],
      )}
    >
      {getKindName()}
    </span>
  );

  return onClick ? (
    <button data-id={kind} type="button" className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

LinkChip.propTypes = {
  kind: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onClick: PropTypes.func,
};

LinkChip.defaultProps = {
  size: Sizes.MEDIUM,
  onClick: undefined,
};

export default LinkChip;
