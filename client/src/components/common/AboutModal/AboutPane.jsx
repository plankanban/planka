/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Header, Image, Loader, Tab } from 'semantic-ui-react';

import version from '../../../version';
import Markdown from '../Markdown';

import aboutLogo from '../../../assets/images/about-logo.png';
import whatsNewUrl from '../../../assets/docs/whats-new.md?url';

import styles from './AboutPane.module.scss';

const AboutPane = React.memo(() => {
  const [t] = useTranslation();
  const [whatsNew, setWhatsNew] = useState(null);

  useEffect(() => {
    async function fetchWhatsNew() {
      let response;
      try {
        response = await fetch(whatsNewUrl);
      } catch {
        return;
      }

      const text = await response.text();
      setWhatsNew(text);
    }

    fetchWhatsNew();
  }, []);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <a href="https://github.com/plankanban/planka" target="_blank" rel="noreferrer">
        <Image centered src={aboutLogo} size="large" />
      </a>
      <div className={styles.version}>Community v{version}</div>
      <Divider horizontal>
        <Header as="h4">
          {t('common.whatsNew', {
            context: 'title',
          })}
        </Header>
      </Divider>
      {whatsNew ? (
        <Markdown>{whatsNew}</Markdown>
      ) : (
        <Loader active inverted inline="centered" size="small" />
      )}
    </Tab.Pane>
  );
});

export default AboutPane;
