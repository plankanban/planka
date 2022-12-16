import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../../lib/custom-ui';

import styles from './ImportStep.module.scss';

const ImportStep = React.memo(({ onSelect, onBack }) => {
  const [t] = useTranslation();

  const handleFileSelect = useCallback(
    (type, file) => {
      onSelect({
        type,
        file,
      });

      onBack();
    },
    [onSelect, onBack],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.importBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <FilePicker onSelect={(file) => handleFileSelect('trello', file)} accept=".json">
          <Button
            fluid
            type="button"
            icon="trello"
            content={t('common.fromTrello')}
            className={styles.button}
          />
        </FilePicker>
      </Popup.Content>
    </>
  );
});

ImportStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ImportStep;
