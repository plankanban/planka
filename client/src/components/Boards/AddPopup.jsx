import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';
import { Input, Popup } from '../../lib/custom-ui';

import { useForm } from '../../hooks';

import styles from './AddPopup.module.scss';

const AddStep = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm({
    name: '',
  });

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      type: 'kanban',
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    onCreate(cleanData);
    onClose();
  }, [onCreate, onClose, data]);

  useEffect(() => {
    nameField.current.select();
  }, []);

  return (
    <>
      <Popup.Header>
        {t('common.createBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input
            fluid
            ref={nameField}
            name="name"
            value={data.name}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <Button positive content={t('action.createBoard')} />
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(AddStep);
