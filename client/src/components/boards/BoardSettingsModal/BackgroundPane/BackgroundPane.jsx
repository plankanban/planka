/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { Tab } from 'semantic-ui-react';

import Gradients from './Gradients';

import styles from './BackgroundPane.module.scss';

const BackgroundPane = React.memo(() => (
  <Tab.Pane attached={false} className={styles.wrapper}>
    <Gradients />
  </Tab.Pane>
));

export default BackgroundPane;
