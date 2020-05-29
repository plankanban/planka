import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import styles from './SocketStatus.module.scss';

const SocketStatus = React.memo(({ isDisconnected, isReconnected }) => {
  const [t] = useTranslation();

  const handleReloadClick = useCallback(() => {
    window.location.reload(true);
  }, []);

  if (isDisconnected) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>{t('common.noConnectionToServer')}</div>
        <div className={styles.content}>
          <Trans i18nKey="common.allChangesWillBeAutomaticallySavedAfterConnectionRestored">
            All changes will be automatically saved
            <br />
            after connection restored
          </Trans>
        </div>
      </div>
    );
  }

  if (isReconnected) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          {t('common.connectionRestored', {
            context: 'title',
          })}
        </div>
        <div className={styles.content}>
          <Trans i18nKey="common.refreshPageToLoadLastDataAndReceiveUpdates">
            <button type="button" className={styles.button} onClick={handleReloadClick}>
              Refresh the page
            </button>
            to load last data
            <br />
            and receive updates
          </Trans>
        </div>
      </div>
    );
  }

  return null;
});

SocketStatus.propTypes = {
  isDisconnected: PropTypes.bool.isRequired,
  isReconnected: PropTypes.bool.isRequired,
};

export default SocketStatus;
