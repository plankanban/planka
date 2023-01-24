import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../../lib/custom-ui';

import styles from './AvatarEditStep.module.scss';

const AvatarEditStep = React.memo(({ defaultValue, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();

  const field = useRef(null);

  const handleFileSelect = useCallback(
    (file) => {
      onUpdate({
        file,
      });

      onClose();
    },
    [onUpdate, onClose],
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
        <div className={styles.action}>
          <FilePicker accept="image/*" onSelect={handleFileSelect}>
            <Button
              ref={field}
              content={t('action.uploadNewAvatar')}
              className={styles.actionButton}
            />
          </FilePicker>
        </div>
        {defaultValue && (
          <Button negative content={t('action.deleteAvatar')} onClick={handleDeleteClick} />
        )}
      </Popup.Content>
    </>
  );
});

AvatarEditStep.propTypes = {
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AvatarEditStep.defaultProps = {
  defaultValue: undefined,
};

export default AvatarEditStep;
