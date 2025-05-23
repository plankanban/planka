/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';

import styles from './EditStep.module.scss';

const EditStep = React.memo(({ baseCustomFieldGroupId, onBack, onClose }) => {
  const selectBaseCustomFieldGroupById = useMemo(
    () => selectors.makeSelectBaseCustomFieldGroupById(),
    [],
  );

  const baseCustomFieldGroup = useSelector((state) =>
    selectBaseCustomFieldGroupById(state, baseCustomFieldGroupId),
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: baseCustomFieldGroup.name,
    }),
    [baseCustomFieldGroup.name],
  );

  const [data, handleFieldChange] = useForm({
    name: '',
    ...defaultData,
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

    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateBaseCustomFieldGroup(baseCustomFieldGroupId, cleanData));
    }

    onClose();
  }, [baseCustomFieldGroupId, onClose, dispatch, defaultData, data, nameFieldRef]);

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editCustomFieldGroup', {
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
          <Button positive content={t('action.save')} />
        </Form>
      </Popup.Content>
    </>
  );
});

EditStep.propTypes = {
  baseCustomFieldGroupId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditStep;
