/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Dropdown, Modal, Segment } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { localeByLanguage } from '../../../locales';
import Markdown from '../Markdown';

import styles from './TermsModal.module.scss';

const splitTermsAndConfirmations = (content) => {
  const separator = '\n[confirmations]::\n---\n';
  const index = content.lastIndexOf(separator);

  if (index === -1) {
    return [content.trim(), []];
  }

  const terms = content.slice(0, index).trim();

  const confirmations = content
    .slice(index + separator.length)
    .split('\n')
    .map((confirmation) => confirmation.replace(/^✔️\s*/, '').replace(/\*\*(.*?)\*\*/, '$1'))
    .filter(Boolean);

  return [terms, confirmations];
};

const TermsModal = React.memo(() => {
  const { termsLanguages } = useSelector(selectors.selectBootstrap);

  const {
    termsForm: { payload: terms, isSubmitting, isCancelling, isLanguageUpdating },
  } = useSelector(selectors.selectAuthenticateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [acceptedConfirmationsSet, setAcceptedConfirmationsSet] = useState(new Set());

  const locales = useMemo(
    () =>
      termsLanguages.map(
        (language) =>
          localeByLanguage[language] || {
            language,
            country: language.split('-')[1]?.toLowerCase(),
            name: language,
          },
      ),
    [termsLanguages],
  );

  const [content, confirmations] = useMemo(
    () => splitTermsAndConfirmations(terms.content),
    [terms.content],
  );

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

  const handleToggleConfirmationAccept = useCallback((index) => {
    setAcceptedConfirmationsSet((prevAcceptedConfirmationsSet) => {
      const nextAcceptedConfirmationsSet = new Set(prevAcceptedConfirmationsSet);

      if (nextAcceptedConfirmationsSet.has(index)) {
        nextAcceptedConfirmationsSet.delete(index);
      } else {
        nextAcceptedConfirmationsSet.add(index);
      }

      return nextAcceptedConfirmationsSet;
    });
  }, []);

  const isAllConfirmationsAccepted = acceptedConfirmationsSet.size === confirmations.length;

  return (
    <Modal open centered={false}>
      <Modal.Content>
        <Dropdown
          fluid
          selection
          options={locales.map((locale) => ({
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
        <Markdown>{content}</Markdown>
        {confirmations.length > 0 && (
          <Segment size="massive" className={styles.confirmations}>
            {confirmations.map((confirmation, index) => (
              <Checkbox
                key={confirmation}
                checked={acceptedConfirmationsSet.has(index)}
                label={confirmation}
                className={styles.confirmationCheckbox}
                onChange={() => handleToggleConfirmationAccept(index)}
              />
            ))}
          </Segment>
        )}
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
        <Button
          positive
          content={t('action.continue')}
          loading={isSubmitting}
          disabled={!isAllConfirmationsAccepted || isSubmitting || isCancelling}
          onClick={handleContinueClick}
        />
      </Modal.Actions>
    </Modal>
  );
});

export default TermsModal;
