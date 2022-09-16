import React from 'react';
// import { useTranslation } from 'react-i18next';
import { Image, Tab } from 'semantic-ui-react';

import logo from '../../assets/images/logo.png';

import styles from './AboutPane.module.scss';

const AboutPane = React.memo(() => {
  // const [t] = useTranslation();

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Image centered src={logo} size="large" className={styles.logo} />
    </Tab.Pane>
  );
});

export default AboutPane;
