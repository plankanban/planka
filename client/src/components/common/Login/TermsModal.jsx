/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Dropdown, Modal } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { localeByLanguage } from '../../../locales';
import TERMS_LANGUAGES from '../../../constants/TermsLanguages';
import Markdown from '../Markdown';

import styles from './TermsModal.module.scss';

const LOCALES = TERMS_LANGUAGES.map((language) => localeByLanguage[language]);

const TermsModal = React.memo(() => {
  const {
    termsForm: { payload: terms, isSubmitting, isCancelling, isLanguageUpdating },
  } = useSelector(selectors.selectAuthenticateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleContinueClick = useCallback(() => {
    dispatch(entryActions.acceptTerms(terms.signature));
  }, [terms.signature, dispatch]);

  const handleCancelClick = useCallback(() => {
    dispatch(entryActions.cancelTerms());
  }, [dispatch]);

  const handleLanguageChange = useCallback(
    (_, { value }) => {
      dispatch(entryActions.updateTermsLanguage(value));
    },
    [dispatch],
  );

  const handleToggleAcceptClick = useCallback((_, { checked }) => {
    setIsTermsAccepted(checked);
  }, []);

  return (
    <Modal open centered={false}>
      <Modal.Content>
        <Dropdown
          fluid
          selection
          options={LOCALES.map((locale) => ({
            value: locale.language,
            flag: locale.country,
            text: locale.name,
          }))}
          value={terms.language}
          loading={isLanguageUpdating}
          disabled={isLanguageUpdating}
          className={styles.language}
          onChange={handleLanguageChange}
        />
        <Markdown>{terms.content}</Markdown>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={t('action.cancelAndClose')}
          floated="left"
          loading={isCancelling}
          disabled={isSubmitting || isCancelling}
          className={styles.cancelButton}
          onClick={handleCancelClick}
        />
        <Checkbox
          label={t('common.iHaveReadAndAgreeToTheseTerms')}
          onChange={handleToggleAcceptClick}
        />
        <Button
          positive
          content={t('action.continue')}
          loading={isSubmitting}
          disabled={!isTermsAccepted || isSubmitting || isCancelling}
          onClick={handleContinueClick}
        />
      </Modal.Actions>
    </Modal>
  );
});

export default TermsModal;
