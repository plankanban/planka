import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../lib/custom-ui';

import { useField } from '../../hooks';

import styles from './EditNameStep.module.css';

const EditNameStep = React.memo(({
  defaultValue, onUpdate, onBack, onClose,
}) => {
  const [t] = useTranslation();
  const [value, handleFieldChange] = useField(defaultValue);

  const field = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      field.current.select();
      return;
    }

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose, value]);

  useEffect(() => {
    field.current.select();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editName', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.name')}</div>
          <Input
            fluid
            ref={field}
            value={value}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <Button positive content={t('action.save')} />
        </Form>
      </Popup.Content>
    </>
  );
});

EditNameStep.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditNameStep;
