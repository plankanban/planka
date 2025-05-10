/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { FilePicker, Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';

import styles from './EditAvatarStep.module.scss';

const EditAvatarStep = React.memo(({ onClose }) => {
  const defaultValue = useSelector((state) => selectors.selectCurrentUser(state).avatar);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const fieldRef = useRef(null);

  const handleFileSelect = useCallback(
    (file) => {
      dispatch(
        entryActions.updateCurrentUserAvatar({
          file,
        }),
      );

      onClose();
    },
    [onClose, dispatch],
  );

  const handleDeleteClick = useCallback(() => {
    dispatch(
      entryActions.updateCurrentUser({
        avatar: null,
      }),
    );

    onClose();
  }, [onClose, dispatch]);

  useEffect(() => {
    fieldRef.current.focus();
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
              ref={fieldRef}
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

EditAvatarStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default EditAvatarStep;
