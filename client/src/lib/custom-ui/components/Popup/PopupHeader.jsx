/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Popup as SemanticUIPopup } from 'semantic-ui-react';
import Tooltip from '../Tooltip';

import styles from './PopupHeader.module.css';

const PopupHeader = React.memo(({ children, onBack }) => {
  const [t] = useTranslation();

  return (
    <SemanticUIPopup.Header className={styles.wrapper}>
      {onBack && (
        <Tooltip content={t('action.goBack')}>
          <Button icon="angle left" onClick={onBack} className={styles.backButton} />
        </Tooltip>
      )}
      <div className={styles.content}>{children}</div>
    </SemanticUIPopup.Header>
  );
});

PopupHeader.propTypes = {
  children: PropTypes.node.isRequired,
  onBack: PropTypes.func,
};

PopupHeader.defaultProps = {
  onBack: undefined,
};

export default PopupHeader;
