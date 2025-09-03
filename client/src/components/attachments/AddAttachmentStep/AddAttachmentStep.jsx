/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import { AttachmentTypes } from '../../../constants/Enums';

import styles from './AddAttachmentStep.module.scss';

const AddAttachmentStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleFilesSelect = useCallback(
    (files) => {
      files.forEach((file) => {
        dispatch(
          entryActions.createAttachmentInCurrentCard({
            file,
            type: AttachmentTypes.FILE,
            name: file.name,
          }),
        );
      });

      onClose();
    },
    [onClose, dispatch],
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
          <FilePicker multiple onSelect={handleFilesSelect}>
            <Menu.Item className={styles.menuItem}>
              <Icon name="computer" className={styles.menuItemIcon} />
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

AddAttachmentStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddAttachmentStep;
