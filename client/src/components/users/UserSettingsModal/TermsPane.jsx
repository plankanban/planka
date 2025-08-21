/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import api from '../../../api';
import Markdown from '../../common/Markdown';

import styles from './TermsPane.module.scss';

const TermsPane = React.memo(() => {
  const type = useSelector((state) => selectors.selectCurrentUser(state).termsType);

  const { i18n } = useTranslation();
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function fetchTerms() {
      let terms;
      try {
        ({ item: terms } = await api.getTerms(type, i18n.resolvedLanguage));
      } catch {
        return;
      }

      setContent(terms.content);
    }

    fetchTerms();
  }, [type, i18n.resolvedLanguage]);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      {content ? (
        <Markdown>{content}</Markdown>
      ) : (
        <Loader active inverted inline="centered" size="small" />
      )}
    </Tab.Pane>
  );
});

export default TermsPane;
