import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import User from '../../User';

import styles from './EditAvatarStep.module.css';

const EditAvatarStep = React.memo(
  ({
    defaultValue, name, isUploading, onUpload, onClear, onBack,
  }) => {
    const [t] = useTranslation();

    const field = useRef(null);

    const handleFieldChange = useCallback(
      ({ target }) => {
        if (target.files[0]) {
          onUpload(target.files[0]);

          target.value = null; // eslint-disable-line no-param-reassign
        }
      },
      [onUpload],
    );

    useEffect(() => {
      field.current.focus();
    }, []);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t('common.editAvatar', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <User name={name} avatar={defaultValue} size="large" />
          <div className={styles.input}>
            <Button content={t('action.uploadNewAvatar')} className={styles.customButton} />
            <input
              ref={field}
              type="file"
              accept="image/*"
              disabled={isUploading}
              className={styles.file}
              onChange={handleFieldChange}
            />
          </div>
          {defaultValue && <Button negative content={t('action.deleteAvatar')} onClick={onClear} />}
        </Popup.Content>
      </>
    );
  },
);

EditAvatarStep.propTypes = {
  defaultValue: PropTypes.string,
  name: PropTypes.string.isRequired,
  isUploading: PropTypes.bool.isRequired,
  onUpload: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

EditAvatarStep.defaultProps = {
  defaultValue: undefined,
};

export default EditAvatarStep;
