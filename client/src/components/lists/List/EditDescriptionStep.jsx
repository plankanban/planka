/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';

import styles from './EditDescriptionStep.module.scss';

const EditDescriptionStep = React.memo(({ listId, onBack, onClose }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const defaultData = useSelector((state) => {
    const list = selectListById(state, listId);

    return {
      description: list.description || null,
    };
  });

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    ...defaultData,
    description: defaultData.description || '',
  }));

  const cleanData = useMemo(
    () => ({
      description: data.description.trim() || null,
    }),
    [data.description],
  );

  const submit = useCallback(() => {
    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateList(listId, cleanData));
    }

    onClose();
  }, [listId, defaultData, cleanData, onClose, dispatch]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleDescriptionKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('action.editDescription', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <TextArea
            autoFocus
            as={TextareaAutosize}
            name="description"
            value={data.description}
            placeholder={t('common.enterDescription')}
            maxLength={1024}
            minRows={4}
            className={styles.field}
            onKeyDown={handleDescriptionKeyDown}
            onChange={handleFieldChange}
          />
          <Button positive disabled={dequal(cleanData, defaultData)} content={t('action.save')} />
        </Form>
      </Popup.Content>
    </>
  );
});

EditDescriptionStep.propTypes = {
  listId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditDescriptionStep;
