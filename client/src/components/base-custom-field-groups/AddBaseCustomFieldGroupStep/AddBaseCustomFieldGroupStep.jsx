/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';

import styles from './AddBaseCustomFieldGroupStep.module.scss';

const AddBaseCustomFieldGroupStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm({
    name: '',
  });

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createBaseCustomFieldGroupInCurrentProject(cleanData));
    onClose();
  }, [onClose, dispatch, data, nameFieldRef]);

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  return (
    <>
      <Popup.Header>
        {t('common.createCustomFieldGroup', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <Button positive content={t('action.createCustomFieldGroup')} />
        </Form>
      </Popup.Content>
    </>
  );
});

AddBaseCustomFieldGroupStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddBaseCustomFieldGroupStep;
