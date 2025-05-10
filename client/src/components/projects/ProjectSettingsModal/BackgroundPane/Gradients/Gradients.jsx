/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';

import BACKGROUND_GRADIENTS from '../../../../../constants/BackgroundGradients';
import Item from './Item';

import styles from './Gradients.module.scss';

const Gradients = React.memo(() => (
  <div className={styles.wrapper}>
    {BACKGROUND_GRADIENTS.map((backgroundGradient) => (
      <Item key={backgroundGradient} name={backgroundGradient} />
    ))}
  </div>
));

export default Gradients;
