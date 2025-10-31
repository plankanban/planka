/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Message } from 'semantic-ui-react';
import { Popup, Input } from '../../../../lib/custom-ui';

import styles from './ApiKeyDisplayStep.module.scss';

const ApiKeyDisplayStep = React.memo(({ apiKey, onBack, onClose }) => {
  const [t] = useTranslation();
  const inputRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inputRef.current && apiKey) {
      inputRef.current.select();
      inputRef.current.focus();
    }
  }, [apiKey]);

  const handleCopy = useCallback(() => {
    if (apiKey && inputRef.current) {
      inputRef.current.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for browsers that don't support execCommand
        navigator.clipboard.writeText(apiKey).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    }
  }, [apiKey]);

  const handleCloseClick = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  if (!apiKey) {
    return (
      <>
        <Popup.Header onBack={onBack}>{t('common.apiKey')}</Popup.Header>
        <Popup.Content>
          <div>{t('common.apiKeyWillBeDisplayedHere')}</div>
        </Popup.Content>
      </>
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.apiKey')}</Popup.Header>
      <Popup.Content>
        <Message warning className={styles.warningMessage}>
          <Message.Header>{t('common.apiKeyWarningHeader')}</Message.Header>
          <p>{t('common.apiKeyWarning')}</p>
        </Message>
        <div className={styles.fieldWrapper}>
          <Input
            fluid
            ref={inputRef}
            value={apiKey}
            readOnly
            className={styles.field}
            icon="key"
            iconPosition="left"
          />
          <Button
            positive={copied}
            color={copied ? 'green' : null}
            className={styles.copyButton}
            onClick={handleCopy}
          >
            <Icon name={copied ? 'check' : 'copy'} />
            {copied ? t('common.copied') : t('action.copy')}
          </Button>
        </div>
        {copied && (
          <Message success className={styles.successMessage}>
            {t('common.apiKeyCopied')}
          </Message>
        )}
        <div className={styles.instructions}>{t('common.apiKeyInstructions')}</div>
        <Button fluid positive onClick={handleCloseClick} className={styles.closeButton}>
          {t('action.close')}
        </Button>
      </Popup.Content>
    </>
  );
});

ApiKeyDisplayStep.propTypes = {
  apiKey: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

ApiKeyDisplayStep.defaultProps = {
  apiKey: null,
  onClose: undefined,
};

export default ApiKeyDisplayStep;
