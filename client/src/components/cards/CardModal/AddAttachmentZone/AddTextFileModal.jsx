/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Header, Modal } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import { useForm, useNestedRef } from '../../../../hooks';

import styles from './AddTextFileModal.module.scss';

const AddTextFileModal = React.memo(({ content, onCreate, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
  }));

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

    const file = new File([content], `${cleanData.name}.txt`, {
      type: 'plain/text',
    });

    onCreate(file);
    onClose();
  }, [content, onCreate, onClose, data, nameFieldRef]);

  useEffect(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  return (
    <Modal open basic closeIcon size="tiny" onClose={onClose}>
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
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={124}
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

AddTextFileModal.propTypes = {
  content: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddTextFileModal;
