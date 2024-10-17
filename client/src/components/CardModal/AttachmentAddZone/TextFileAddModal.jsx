import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Header, Modal } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import { useForm } from '../../../hooks';

import styles from './TextFileAddModal.module.scss';

const TextFileAddModal = React.memo(({ content, onCreate, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
  }));

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

    const file = new File([content], `${cleanData.name}.txt`, {
      type: 'plain/text',
    });

    onCreate(file);
    onClose();
  }, [content, onCreate, onClose, data]);

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <Modal open basic centered closeIcon size="tiny" onClose={onClose}>
      <Modal.Content>
        <Header inverted size="huge">
          {t('common.createTextFile', {
            context: 'title',
          })}
        </Header>
        <p>{t('common.enterFilename')}</p>
        <Form onSubmit={handleSubmit}>
          <Input
            fluid
            inverted
            ref={nameField}
            name="name"
            value={data.name}
            label=".txt"
            labelPosition="right"
            className={styles.field}
            onChange={handleFieldChange}
          />
          <Button
            inverted
            color="green"
            icon="checkmark"
            content={t('action.createFile')}
            floated="right"
          />
        </Form>
      </Modal.Content>
    </Modal>
  );
});

TextFileAddModal.propTypes = {
  content: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TextFileAddModal;
