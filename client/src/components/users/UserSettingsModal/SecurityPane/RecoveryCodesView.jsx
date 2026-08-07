/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';

import styles from './RecoveryCodesView.module.scss';

const RecoveryCodesView = React.memo(({ codes, className }) => {
  const [t] = useTranslation();

  const handleCopyClick = useCallback(() => {
    const text = codes.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }, [codes]);

  const handleDownloadClick = useCallback(() => {
    const text = codes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'planka-recovery-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [codes]);

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <ul className={styles.list}>
        {codes.map((code) => (
          <li key={code}>
            <code>{code}</code>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button
          basic
          size="small"
          icon="copy"
          content={t('action.copyAll')}
          onClick={handleCopyClick}
        />
        <Button
          basic
          size="small"
          icon="download"
          content={t('action.download')}
          onClick={handleDownloadClick}
        />
      </div>
    </div>
  );
});

RecoveryCodesView.propTypes = {
  codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

RecoveryCodesView.defaultProps = {
  className: undefined,
};

export default RecoveryCodesView;
