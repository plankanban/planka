import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { withPopup } from '../../../lib/popup';
import { Popup } from '../../../lib/custom-ui';

import styles from './EditAvatarPopup.module.css';

const EditAvatarStep = React.memo(({ defaultValue, onUpload, onDelete, onClose }) => {
  const [t] = useTranslation();

  const field = useRef(null);

  const handleFieldChange = useCallback(
    ({ target }) => {
      if (target.files[0]) {
        onUpload(target.files[0]);
        onClose();
      }
    },
    [onUpload, onClose],
  );

  const handleDeleteClick = useCallback(() => {
    onDelete();
    onClose();
  }, [onDelete, onClose]);

  useEffect(() => {
    field.current.focus();
  }, []);

  return (
    <>
      <Popup.Header>
        {t('common.editAvatar', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <div className={styles.input}>
          <Button content={t('action.uploadNewAvatar')} className={styles.customButton} />
          <input
            ref={field}
            type="file"
            accept="image/*"
            className={styles.file}
            onChange={handleFieldChange}
          />
        </div>
        {defaultValue && (
          <Button negative content={t('action.deleteAvatar')} onClick={handleDeleteClick} />
        )}
      </Popup.Content>
    </>
  );
});

EditAvatarStep.propTypes = {
  defaultValue: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditAvatarStep.defaultProps = {
  defaultValue: undefined,
};

export default withPopup(EditAvatarStep);
