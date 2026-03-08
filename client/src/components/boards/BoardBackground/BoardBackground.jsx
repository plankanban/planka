/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { BoardBackgroundTypes } from '../../../constants/Enums';

import styles from './BoardBackground.module.scss';
import globalStyles from '../../../styles.module.scss';

const BoardBackground = React.memo(() => {
  const { backgroundType, backgroundGradient } = useSelector(selectors.selectCurrentBoard);

  return (
    <div
      className={classNames(
        styles.wrapper,
        backgroundType === BoardBackgroundTypes.GRADIENT &&
          globalStyles[`background${upperFirst(camelCase(backgroundGradient))}`],
      )}
    />
  );
});

export default BoardBackground;
