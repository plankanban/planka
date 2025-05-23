/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Tab } from 'semantic-ui-react';

import Comments from '../../comments/Comments';
import CardActivities from '../../activities/CardActivities';

import styles from './Communication.module.scss';

const Communication = React.memo(() => {
  const [t] = useTranslation();

  const panes = [
    {
      menuItem: (
        <Menu.Item key="comments" className={styles.menuItem}>
          {t('common.comments', {
            context: 'title',
          })}
        </Menu.Item>
      ),
      render: () => <Comments />,
    },
    {
      menuItem: (
        <Menu.Item key="actions" className={styles.menuItem}>
          {t('common.actions', {
            context: 'title',
          })}
        </Menu.Item>
      ),
      render: () => <CardActivities />,
    },
  ];

  return (
    <Tab
      menu={{
        secondary: true,
        pointing: true,
      }}
      panes={panes}
    />
  );
});

export default Communication;
