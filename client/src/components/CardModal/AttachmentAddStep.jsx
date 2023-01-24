import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../lib/custom-ui';

import styles from './AttachmentAddStep.module.scss';

const AttachmentAddStep = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();

  const handleFileSelect = useCallback(
    (file) => {
      onCreate({
        file,
      });
      onClose();
    },
    [onCreate, onClose],
  );

  return (
    <>
      <Popup.Header>
        {t('common.addAttachment', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <FilePicker onSelect={handleFileSelect}>
            <Menu.Item className={styles.menuItem}>
              {t('common.fromComputer', {
                context: 'title',
              })}
            </Menu.Item>
          </FilePicker>
        </Menu>
        <hr className={styles.divider} />
        <div className={styles.tip}>
          {t('common.pressPasteShortcutToAddAttachmentFromClipboard')}
        </div>
      </Popup.Content>
    </>
  );
});

AttachmentAddStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AttachmentAddStep;
