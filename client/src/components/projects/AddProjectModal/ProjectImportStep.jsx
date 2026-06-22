/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../../lib/custom-ui';

import styles from './ProjectImportStep.module.scss';

const ProjectImportStep = React.memo(({ onSelect, onClose }) => {
  const [t] = useTranslation();

  const handleFileSelect = useCallback(
    (type, file) => {
      onSelect({
        type,
        file,
      });

      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <>
      <Popup.Header onClose={onClose}>
        {t('common.importProject', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <FilePicker accept=".json" onSelect={(file) => handleFileSelect('planka-json', file)}>
          <Button fluid content={t('common.fromJsonFile')} icon="file" className={styles.button} />
        </FilePicker>
      </Popup.Content>
    </>
  );
});

ProjectImportStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProjectImportStep;
