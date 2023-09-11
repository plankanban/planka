import { dequal } from 'dequal';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'semantic-ui-react';

import { useForm } from '../../hooks';

import styles from './UserInformationEdit.module.scss';

const UserInformationEdit = React.memo(({ defaultData, isNameEditable, onUpdate }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    phone: '',
    organization: '',
    ...pickBy(defaultData),
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

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    if (isNameEditable) {
      if (!cleanData.name) {
        nameField.current.select();
        return;
      }

      onUpdate(cleanData);
    } else {
      onUpdate(omit(cleanData, 'name'));
    }
  }, [isNameEditable, onUpdate, cleanData]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.name')}</div>
      <Input
        fluid
        ref={nameField}
        name="name"
        value={data.name}
        disabled={!isNameEditable}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <div className={styles.text}>{t('common.phone')}</div>
      <Input
        fluid
        name="phone"
        value={data.phone}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <div className={styles.text}>{t('common.organization')}</div>
      <Input
        fluid
        name="organization"
        value={data.organization}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <Button positive disabled={dequal(cleanData, defaultData)} content={t('action.save')} />
    </Form>
  );
});

UserInformationEdit.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isNameEditable: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default UserInformationEdit;
