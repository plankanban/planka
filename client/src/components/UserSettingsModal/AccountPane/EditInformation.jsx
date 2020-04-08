import dequal from 'dequal';
import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'semantic-ui-react';

import { useForm } from '../../../hooks';

import styles from './EditInformation.module.css';

const EditInformation = React.memo(({ defaultData, onUpdate }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm({
    name: '',
    ...defaultData,
  });

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    onUpdate(cleanData);
  }, [onUpdate, data]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.name')}</div>
      <Input
        fluid
        ref={nameField}
        name="name"
        value={data.name}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <Button positive disabled={dequal(data, defaultData)} content={t('action.save')} />
    </Form>
  );
});

EditInformation.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default EditInformation;
