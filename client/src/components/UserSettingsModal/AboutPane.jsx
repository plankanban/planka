import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Tab } from 'semantic-ui-react';

import version from '../../version';

import logo from '../../assets/images/logo.png';

import styles from './AboutPane.module.scss';

const AboutPane = React.memo(() => {
  const [t] = useTranslation();

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Image centered src={logo} size="large" />
      <div className={styles.version}>
        {t('common.version')} {version}
      </div>
    </Tab.Pane>
  );
});

export default AboutPane;
