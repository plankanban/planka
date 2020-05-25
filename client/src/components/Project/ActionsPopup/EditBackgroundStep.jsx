import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../../lib/custom-ui';

import styles from './EditBackgroundStep.module.css';

const EditBackgroundStep = React.memo(
  ({ defaultValue, isImageUpdating, onImageUpdate, onImageDelete, onBack }) => {
    const [t] = useTranslation();

    const field = useRef(null);

    const handleFileSelect = useCallback(
      (file) => {
        onImageUpdate({
          file,
        });
      },
      [onImageUpdate],
    );

    useEffect(() => {
      field.current.focus();
    }, []);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t('common.editBackground', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <div className={styles.action}>
            <FilePicker accept="image/*" onSelect={handleFileSelect}>
              <Button
                ref={field}
                content={t('action.uploadNewBackground')}
                loading={isImageUpdating}
                disabled={isImageUpdating}
                className={styles.actionButton}
              />
            </FilePicker>
          </div>
          {defaultValue && (
            <Button
              negative
              content={t('action.deleteBackground')}
              disabled={isImageUpdating}
              onClick={onImageDelete}
            />
          )}
        </Popup.Content>
      </>
    );
  },
);

EditBackgroundStep.propTypes = {
  defaultValue: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isImageUpdating: PropTypes.bool.isRequired,
  // onUpdate: PropTypes.func.isRequired,
  onImageUpdate: PropTypes.func.isRequired,
  onImageDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

EditBackgroundStep.defaultProps = {
  defaultValue: undefined,
};

export default EditBackgroundStep;
