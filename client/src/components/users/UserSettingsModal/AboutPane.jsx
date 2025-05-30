/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { Image, Tab } from 'semantic-ui-react';

import version from '../../../version';

import logo from '../../../assets/images/logo.png';

import styles from './AboutPane.module.scss';

const AboutPane = React.memo(() => (
  <Tab.Pane attached={false} className={styles.wrapper}>
    <a href="https://github.com/plankanban/planka" target="_blank" rel="noreferrer">
      <Image centered src={logo} size="large" />
    </a>
    <div className={styles.version}>{version}</div>
  </Tab.Pane>
));

export default AboutPane;
