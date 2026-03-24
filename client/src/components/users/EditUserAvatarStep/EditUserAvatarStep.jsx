/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';

import { FilePicker, Popup } from '../../../lib/custom-ui';
import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './EditUserAvatarStep.module.scss';

const EditUserAvatarStep = React.memo(({ id, onBack, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const user = useSelector((state) => selectUserById(state, id));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const fieldRef = useRef(null);

  const handleFileSelect = useCallback(
    (file) => {
      dispatch(
        entryActions.updateUserAvatar(id, {
          file,
        }),
      );

      onClose();
    },
    [dispatch, id, onClose],
  );

  const handleDeleteClick = useCallback(() => {
    dispatch(
      entryActions.updateUser(id, {
        avatar: null,
      }),
    );

    onClose();
  }, [dispatch, id, onClose]);

  useEffect(() => {
    fieldRef.current?.focus?.();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editAvatar', {
          context: 'title',
        })}
      </Popup.Header>

      <Popup.Content>
        <div className={styles.action}>
          <FilePicker accept="image/*" onSelect={handleFileSelect}>
            <Button
              ref={fieldRef}
              fluid
              className={styles.actionButton}
              content={t('action.uploadNewAvatar')}
            />
          </FilePicker>
        </div>

        {user?.avatar && (
          <Button fluid negative content={t('action.deleteAvatar')} onClick={handleDeleteClick} />
        )}
      </Popup.Content>
    </>
  );
});

EditUserAvatarStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditUserAvatarStep.defaultProps = {
  onBack: undefined,
};

export default EditUserAvatarStep;
