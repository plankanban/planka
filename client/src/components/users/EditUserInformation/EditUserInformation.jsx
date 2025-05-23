/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import omit from 'lodash/omit';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';

import styles from './EditUserInformation.module.scss';

const EditUserInformation = React.memo(({ id, onUpdate }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const user = useSelector((state) => selectUserById(state, id));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: user.name,
      phone: user.phone,
      organization: user.organization,
    }),
    [user.name, user.phone, user.organization],
  );

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
    phone: defaultData.phone || '',
    organization: defaultData.organization || '',
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
      phone: data.phone.trim() || null,
      organization: data.organization.trim() || null,
    }),
    [data],
  );

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const isNameEditable = !user.lockedFieldNames.includes('name');

  const handleSubmit = useCallback(() => {
    if (isNameEditable && !cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.updateUser(id, isNameEditable ? cleanData : omit(cleanData, 'name')));

    if (onUpdate) {
      onUpdate();
    }
  }, [id, onUpdate, dispatch, cleanData, nameFieldRef, isNameEditable]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.name')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        disabled={!isNameEditable}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <div className={styles.text}>{t('common.phone')}</div>
      <Input
        fluid
        name="phone"
        value={data.phone}
        maxLength={128}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <div className={styles.text}>{t('common.organization')}</div>
      <Input
        fluid
        name="organization"
        value={data.organization}
        maxLength={128}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <Button positive disabled={dequal(cleanData, defaultData)} content={t('action.save')} />
    </Form>
  );
});

EditUserInformation.propTypes = {
  id: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
};

EditUserInformation.defaultProps = {
  onUpdate: undefined,
};

export default EditUserInformation;
